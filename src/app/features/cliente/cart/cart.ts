import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
    selector: 'app-cart',
    imports: [CommonModule],
    templateUrl: './cart.html',
    styleUrl: './cart.css'
})
export class CartComponent {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    cartService = inject(CartService);

    enviando = signal(false);
    private mesaId = '';

    constructor() {
        this.mesaId = this.route.snapshot.paramMap.get('mesaId')!;
    }

    volver() {
        this.router.navigate(['/mesa', this.mesaId, 'menu']);
    }

    async confirmar() {
        if (this.cartService.items().length === 0) return;

        this.enviando.set(true);
        try {
            const pedidoId = await this.cartService.confirmarPedido();
            this.router.navigate(['/mesa', this.mesaId, 'pedido', pedidoId]);
        } catch (error) {
            console.error('Error al crear pedido:', error);
            this.enviando.set(false);
            alert('Error al enviar el pedido. Intenta de nuevo.');
        }
    }
}
