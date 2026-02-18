import { Injectable, computed, signal } from '@angular/core';
import { inject } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { OrderItem, ModificadorAplicado } from '../models/smart-order.model';
import { Product } from '../models/product.model';
import { serverTimestamp } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class CartService {
    private firestoreService = inject(FirestoreService);

    // ─── Estado ─────────────────────────────────────────────────
    mesaId = signal<string>('');
    clienteUid = signal<string>('');
    items = signal<OrderItem[]>([]);

    // ─── Computed ───────────────────────────────────────────────
    itemCount = computed(() =>
        this.items().reduce((sum, item) => sum + item.cantidad, 0)
    );

    subtotal = computed(() =>
        this.items().reduce((sum, item) => sum + (item.precio_snapshot * item.cantidad), 0)
    );

    total = computed(() => this.subtotal());

    // ─── Acciones ───────────────────────────────────────────────

    /** Agregar un producto al carrito */
    addItem(
        product: Product,
        cantidad: number,
        especificaciones: string,
        modificadores: ModificadorAplicado[]
    ) {
        // Calcular precio con modificadores
        const precioModificadores = modificadores.reduce(
            (sum, mod) => sum + mod.precio_adicional_snapshot, 0
        );
        const precioFinal = product.precio + precioModificadores;

        const newItem: OrderItem = {
            producto_id: product.id!,
            nombre: product.nombre,
            precio_snapshot: precioFinal,
            cantidad,
            especificaciones,
            modificadores_aplicados: modificadores
        };

        this.items.update(current => [...current, newItem]);
    }

    /** Eliminar un item por índice */
    removeItem(index: number) {
        this.items.update(current => current.filter((_, i) => i !== index));
    }

    /** Actualizar cantidad de un item */
    updateQuantity(index: number, cantidad: number) {
        if (cantidad <= 0) {
            this.removeItem(index);
            return;
        }
        this.items.update(current =>
            current.map((item, i) => i === index ? { ...item, cantidad } : item)
        );
    }

    /** Limpiar carrito */
    clearCart() {
        this.items.set([]);
    }

    /** Confirmar pedido → escribe en Firestore */
    async confirmarPedido(): Promise<string> {
        const order = {
            mesa_id: this.mesaId(),
            cliente_uid: this.clienteUid(),
            atendido_por_id: '',
            cocinado_por_id: '',
            estado: 'pendiente' as const,
            items: this.items(),
            descuento_aplicado: null,
            subtotal: this.subtotal(),
            total: this.total(),
            timestamp: serverTimestamp()
        };

        const pedidoId = await this.firestoreService.crearPedido(order, this.mesaId());
        this.clearCart();
        return pedidoId;
    }
}
