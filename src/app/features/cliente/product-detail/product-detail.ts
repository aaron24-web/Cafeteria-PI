import { Component, inject, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../core/services/firestore.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';
import { ModificadorGrupo, ModificadorAplicado } from '../../../core/models/smart-order.model';

@Component({
    selector: 'app-product-detail',
    imports: [CommonModule, FormsModule],
    templateUrl: './product-detail.html',
    styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
    private firestoreService = inject(FirestoreService);
    private cartService = inject(CartService);

    @Input() product!: Product;
    @Output() close = new EventEmitter<void>();

    modificadores = signal<ModificadorGrupo[]>([]);
    selecciones = signal<Record<string, string[]>>({});
    especificaciones = '';
    cantidad = signal(1);
    agregado = signal(false);

    ngOnInit() {
        // Cargar modificadores del producto
        this.firestoreService.getModificadoresByProducto(this.product.id!).subscribe({
            next: (mods) => this.modificadores.set(mods)
        });
    }

    toggleOpcion(grupoId: string, opcionId: string, multiple: boolean) {
        this.selecciones.update(current => {
            const copy = { ...current };
            if (multiple) {
                const arr = copy[grupoId] || [];
                if (arr.includes(opcionId)) {
                    copy[grupoId] = arr.filter(id => id !== opcionId);
                } else {
                    copy[grupoId] = [...arr, opcionId];
                }
            } else {
                copy[grupoId] = [opcionId];
            }
            return copy;
        });
    }

    isSelected(grupoId: string, opcionId: string): boolean {
        return (this.selecciones()[grupoId] || []).includes(opcionId);
    }

    get precioTotal(): number {
        let precio = this.product.precio;
        for (const grupo of this.modificadores()) {
            const seleccionadas = this.selecciones()[grupo.id!] || [];
            for (const opcion of grupo.opciones) {
                if (seleccionadas.includes(opcion.id)) {
                    precio += opcion.precio_adicional;
                }
            }
        }
        return precio;
    }

    get puedeAgregar(): boolean {
        // Verificar que todos los modificadores obligatorios tienen selección
        for (const grupo of this.modificadores()) {
            if (grupo.obligatorio) {
                const sel = this.selecciones()[grupo.id!] || [];
                if (sel.length === 0) return false;
            }
        }
        return true;
    }

    incrementar() { this.cantidad.update(c => c + 1); }
    decrementar() { this.cantidad.update(c => Math.max(1, c - 1)); }

    agregar() {
        // Construir los modificadores aplicados
        const modificadoresAplicados: ModificadorAplicado[] = [];
        for (const grupo of this.modificadores()) {
            const sel = this.selecciones()[grupo.id!] || [];
            for (const opcion of grupo.opciones) {
                if (sel.includes(opcion.id)) {
                    modificadoresAplicados.push({
                        grupo_id: grupo.id!,
                        opcion_id: opcion.id,
                        nombre: `${grupo.nombre} ${opcion.nombre}`,
                        precio_adicional_snapshot: opcion.precio_adicional
                    });
                }
            }
        }

        this.cartService.addItem(
            this.product,
            this.cantidad(),
            this.especificaciones,
            modificadoresAplicados
        );

        // Feedback visual
        this.agregado.set(true);
        setTimeout(() => this.close.emit(), 600);
    }

    cerrar() {
        this.close.emit();
    }
}
