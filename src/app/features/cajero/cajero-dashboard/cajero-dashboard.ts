import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../core/services/firestore.service';
import { AuthService } from '../../../core/services/auth';
import { Router } from '@angular/router';
import { Order, Mesa } from '../../../core/models/smart-order.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-cajero-dashboard',
    imports: [CommonModule],
    templateUrl: './cajero-dashboard.html',
    styleUrl: './cajero-dashboard.css'
})
export class CajeroDashboardComponent implements OnInit, OnDestroy {
    private firestoreService = inject(FirestoreService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private subs: Subscription[] = [];

    // ─── Estado ─────────────────────────────────────────────────
    pedidosListos = signal<Order[]>([]);
    mesas = signal<Mesa[]>([]);
    loading = signal(true);
    tabActiva = signal<'entregas' | 'mesas'>('entregas');

    // ─── Computed helpers ───────────────────────────────────────
    get mesasLibres() { return this.mesas().filter(m => m.estado === 'libre'); }
    get mesasOcupadas() { return this.mesas().filter(m => m.estado === 'ocupada'); }
    get mesasSucias() { return this.mesas().filter(m => m.estado === 'sucia'); }

    ngOnInit() {
        // Pedidos listos para entregar
        this.subs.push(
            this.firestoreService.getPedidosByEstados(['listo']).subscribe({
                next: (pedidos) => {
                    const sorted = pedidos.sort((a, b) => {
                        const tA = a.timestamp?.seconds ?? 0;
                        const tB = b.timestamp?.seconds ?? 0;
                        return tA - tB;
                    });
                    this.pedidosListos.set(sorted);
                    this.loading.set(false);
                }
            })
        );

        // Todas las mesas
        this.subs.push(
            this.firestoreService.getMesas().subscribe({
                next: (mesas) => this.mesas.set(mesas)
            })
        );
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
    }

    /** Tiempo transcurrido */
    tiempoTranscurrido(timestamp: any): string {
        if (!timestamp?.seconds) return '';
        const diff = Math.floor((Date.now() - timestamp.seconds * 1000) / 60000);
        if (diff < 1) return 'Ahora';
        if (diff < 60) return `${diff} min`;
        return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    }

    mesaNumero(mesaId: string): string {
        return mesaId.replace('mesa_', '');
    }

    /** Entregar pedido → estado "entregado" + mesa "sucia" */
    async entregar(pedido: Order) {
        await this.firestoreService.entregarPedido(pedido.id!, pedido.mesa_id);
    }

    /** Liberar mesa → estado "libre" */
    async liberarMesa(mesa: Mesa) {
        await this.firestoreService.liberarMesa(mesa.id!);
    }

    /** Cerrar sesión */
    async cerrarSesion() {
        await this.authService.logout();
        this.router.navigate(['/login']);
    }
}
