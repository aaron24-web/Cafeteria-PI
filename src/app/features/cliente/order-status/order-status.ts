import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../../../core/services/firestore.service';
import { Order } from '../../../core/models/smart-order.model';

@Component({
    selector: 'app-order-status',
    imports: [CommonModule],
    templateUrl: './order-status.html',
    styleUrl: './order-status.css'
})
export class OrderStatusComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private firestoreService = inject(FirestoreService);

    pedido = signal<Order | null>(null);
    loading = signal(true);

    readonly estados = [
        { key: 'pendiente', label: 'Pendiente', icon: '🕐' },
        { key: 'en_preparacion', label: 'En preparación', icon: '👨‍🍳' },
        { key: 'listo', label: 'Listo', icon: '✅' },
        { key: 'entregado', label: 'Entregado', icon: '🍽' }
    ];

    ngOnInit() {
        const pedidoId = this.route.snapshot.paramMap.get('pedidoId')!;

        this.firestoreService.getPedido(pedidoId).subscribe({
            next: (pedido) => {
                this.pedido.set(pedido);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    getEstadoIndex(estado: string): number {
        return this.estados.findIndex(e => e.key === estado);
    }

    isCompleted(estadoKey: string): boolean {
        const pedido = this.pedido();
        if (!pedido) return false;
        return this.getEstadoIndex(pedido.estado) >= this.getEstadoIndex(estadoKey);
    }

    isCurrent(estadoKey: string): boolean {
        return this.pedido()?.estado === estadoKey;
    }
}
