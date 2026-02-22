import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../../core/services/firestore.service';
import { Order } from '../../../core/models/smart-order.model';
import { switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-order-status',
    imports: [CommonModule],
    templateUrl: './order-status.html',
    styleUrl: './order-status.css'
})
export class OrderStatusComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
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

        this.firestoreService.getPedido(pedidoId).pipe(
            tap(pedido => {
                this.pedido.set(pedido);
                this.loading.set(false);
            }),
            switchMap(pedido => {
                if (!pedido) return of(null);
                return this.firestoreService.getMesa(pedido.mesa_id);
            })
        ).subscribe({
            next: (mesa) => {
                if (mesa && mesa.estado === 'sucia') {
                    this.router.navigate(['/mesa', mesa.id]);
                }
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
