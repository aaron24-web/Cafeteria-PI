import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../../core/services/firestore.service';
import { CartService } from '../../../core/services/cart.service';
import { Mesa, BusinessConfig } from '../../../core/models/smart-order.model';

@Component({
    selector: 'app-mesa-entry',
    imports: [CommonModule],
    templateUrl: './mesa-entry.html',
    styleUrl: './mesa-entry.css'
})
export class MesaEntryComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private firestoreService = inject(FirestoreService);
    private cartService = inject(CartService);

    mesa = signal<Mesa | null>(null);
    config = signal<BusinessConfig | null>(null);
    loading = signal(true);
    error = signal('');

    ngOnInit() {
        const mesaId = this.route.snapshot.paramMap.get('mesaId')!;

        // Cargar datos de la mesa
        this.firestoreService.getMesa(mesaId).subscribe({
            next: (mesa) => {
                if (mesa) {
                    this.mesa.set(mesa);
                    this.loading.set(false);
                } else {
                    this.error.set('Mesa no encontrada');
                    this.loading.set(false);
                }
            },
            error: () => {
                this.error.set('Error al cargar la mesa');
                this.loading.set(false);
            }
        });

        // Cargar configuración del negocio
        this.firestoreService.getConfiguracion().subscribe({
            next: (config) => this.config.set(config)
        });
    }

    /** Solo inicializar carrito y navegar si la mesa está libre */
    entrarAlMenu() {
        const mesaId = this.route.snapshot.paramMap.get('mesaId')!;
        const clienteUid = 'anon_' + Math.random().toString(36).substring(2, 10);
        this.cartService.mesaId.set(mesaId);
        this.cartService.clienteUid.set(clienteUid);
        this.router.navigate(['/mesa', mesaId, 'menu']);
    }

    /** Si la mesa está ocupada, redirigir al pedido activo */
    verPedidoActivo() {
        const mesaId = this.route.snapshot.paramMap.get('mesaId')!;
        const pedidoId = this.mesa()?.pedido_activo_id;
        if (pedidoId) {
            this.router.navigate(['/mesa', mesaId, 'pedido', pedidoId]);
        }
    }
}
