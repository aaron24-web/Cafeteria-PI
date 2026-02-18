import { inject, Injectable } from '@angular/core';
import {
    Firestore,
    collection,
    collectionData,
    doc,
    docData,
    addDoc,
    updateDoc,
    query,
    where
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import {
    BusinessConfig,
    Categoria,
    Mesa,
    ModificadorGrupo,
    Order
} from '../models/smart-order.model';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
    private firestore = inject(Firestore);

    // ─── Catálogo ───────────────────────────────────────────────

    /** Categorías activas ordenadas por orden_visual */
    getCategorias(): Observable<Categoria[]> {
        const ref = collection(this.firestore, 'categorias');
        const q = query(ref, where('activa', '==', true));
        return (collectionData(q, { idField: 'id' }) as Observable<Categoria[]>).pipe(
            map(cats => cats.sort((a, b) => a.orden_visual - b.orden_visual))
        );
    }

    /** Productos disponibles de una categoría */
    getProductosByCategoria(categoriaId: string): Observable<Product[]> {
        const ref = collection(this.firestore, 'productos');
        const q = query(
            ref,
            where('categoria_id', '==', categoriaId),
            where('disponible', '==', true)
        );
        return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
    }

    /** Todos los productos (incluye no disponibles, para admin) */
    getProducts(): Observable<Product[]> {
        const ref = collection(this.firestore, 'productos');
        return collectionData(ref, { idField: 'id' }) as Observable<Product[]>;
    }

    /** Grupos de modificadores activos de un producto */
    getModificadoresByProducto(productoId: string): Observable<ModificadorGrupo[]> {
        const ref = collection(this.firestore, 'modificadores_productos');
        const q = query(
            ref,
            where('producto_id', '==', productoId),
            where('activo', '==', true)
        );
        return collectionData(q, { idField: 'id' }) as Observable<ModificadorGrupo[]>;
    }

    // ─── Mesas ──────────────────────────────────────────────────

    /** Obtener una mesa por ID */
    getMesa(mesaId: string): Observable<Mesa> {
        return docData(
            doc(this.firestore, `mesas/${mesaId}`),
            { idField: 'id' }
        ) as Observable<Mesa>;
    }

    /** Actualizar campos de una mesa */
    async updateMesa(mesaId: string, data: Partial<Mesa>) {
        const ref = doc(this.firestore, `mesas/${mesaId}`);
        return updateDoc(ref, data);
    }

    /** Obtener todas las mesas en tiempo real */
    getMesas(): Observable<Mesa[]> {
        const ref = collection(this.firestore, 'mesas');
        return (collectionData(ref, { idField: 'id' }) as Observable<Mesa[]>).pipe(
            map(mesas => mesas.sort((a, b) => a.numero - b.numero))
        );
    }

    /** Liberar una mesa (sucia → libre) */
    async liberarMesa(mesaId: string) {
        return this.updateMesa(mesaId, {
            estado: 'libre',
            pedido_activo_id: null
        });
    }

    // ─── Pedidos ────────────────────────────────────────────────

    /** Crear un nuevo pedido y actualizar la mesa */
    async crearPedido(order: Omit<Order, 'id'>, mesaId: string): Promise<string> {
        // 1. Crear el documento del pedido
        const pedidosRef = collection(this.firestore, 'pedidos');
        const docRef = await addDoc(pedidosRef, order);

        // 2. Actualizar la mesa con el pedido activo
        await this.updateMesa(mesaId, {
            pedido_activo_id: docRef.id,
            estado: 'ocupada'
        });

        return docRef.id;
    }

    /** Obtener un pedido en tiempo real */
    getPedido(pedidoId: string): Observable<Order> {
        return docData(
            doc(this.firestore, `pedidos/${pedidoId}`),
            { idField: 'id' }
        ) as Observable<Order>;
    }

    /** Pedidos en tiempo real filtrados por múltiples estados */
    getPedidosByEstados(estados: string[]): Observable<Order[]> {
        const ref = collection(this.firestore, 'pedidos');
        const q = query(ref, where('estado', 'in', estados));
        return collectionData(q, { idField: 'id' }) as Observable<Order[]>;
    }

    /** Actualizar estado de un pedido */
    async actualizarEstadoPedido(pedidoId: string, nuevoEstado: string, extras: Partial<Order> = {}) {
        const ref = doc(this.firestore, `pedidos/${pedidoId}`);
        return updateDoc(ref, { estado: nuevoEstado, ...extras });
    }

    /** Entregar pedido: listo → entregado + mesa → sucia */
    async entregarPedido(pedidoId: string, mesaId: string) {
        await this.actualizarEstadoPedido(pedidoId, 'entregado');
        await this.updateMesa(mesaId, { estado: 'sucia' });
    }

    // ─── Configuración ─────────────────────────────────────────

    /** Configuración global del negocio (IVA, nombre, etc.) */
    getConfiguracion(): Observable<BusinessConfig> {
        return docData(
            doc(this.firestore, 'configuracion_negocio/ajustes_globales')
        ) as Observable<BusinessConfig>;
    }
}
