import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../../core/services/firestore.service';
import { CartService } from '../../../core/services/cart.service';
import { Categoria } from '../../../core/models/smart-order.model';
import { Product } from '../../../core/models/product.model';
import { ProductDetailComponent } from '../product-detail/product-detail';

@Component({
    selector: 'app-menu-categorias',
    imports: [CommonModule, ProductDetailComponent],
    templateUrl: './menu-categorias.html',
    styleUrl: './menu-categorias.css'
})
export class MenuCategoriasComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private firestoreService = inject(FirestoreService);
    cartService = inject(CartService);

    categorias = signal<Categoria[]>([]);
    categoriaActiva = signal<string>('');
    productos = signal<Product[]>([]);
    loading = signal(true);

    // Modal detalle de producto
    productoSeleccionado = signal<Product | null>(null);

    private mesaId = '';

    ngOnInit() {
        this.mesaId = this.route.snapshot.paramMap.get('mesaId')!;

        // Si no hay mesaId en el cart, redirigir al entry
        if (!this.cartService.mesaId()) {
            this.cartService.mesaId.set(this.mesaId);
            const clienteUid = 'anon_' + Math.random().toString(36).substring(2, 10);
            this.cartService.clienteUid.set(clienteUid);
        }

        // Cargar categorías
        this.firestoreService.getCategorias().subscribe({
            next: (cats) => {
                this.categorias.set(cats);
                if (cats.length > 0) {
                    this.seleccionarCategoria(cats[0].id!);
                }
                this.loading.set(false);
            }
        });
    }

    seleccionarCategoria(catId: string) {
        this.categoriaActiva.set(catId);
        this.firestoreService.getProductosByCategoria(catId).subscribe({
            next: (prods) => this.productos.set(prods)
        });
    }

    abrirDetalle(product: Product) {
        this.productoSeleccionado.set(product);
    }

    cerrarDetalle() {
        this.productoSeleccionado.set(null);
    }

    irAlCarrito() {
        this.router.navigate(['/mesa', this.mesaId, 'carrito']);
    }
}
