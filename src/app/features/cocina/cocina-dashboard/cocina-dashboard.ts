import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../core/services/firestore.service';
import { AuthService } from '../../../core/services/auth';
import { Router } from '@angular/router';
import { Order } from '../../../core/models/smart-order.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-cocina-dashboard',
    imports: [CommonModule],
    templateUrl: './cocina-dashboard.html',
    styleUrl: './cocina-dashboard.css'
})
export class CocinaDashboardComponent implements OnInit, OnDestroy {
    private firestoreService = inject(FirestoreService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private sub!: Subscription;

    pedidos = signal<Order[]>([]);
    loading = signal(true);

    // Columnas del Kanban
    get pendientes() {
        return this.pedidos().filter(p => p.estado === 'pendiente');
    }
    get enPreparacion() {
        return this.pedidos().filter(p => p.estado === 'en_preparacion');
    }
    get listos() {
        return this.pedidos().filter(p => p.estado === 'listo');
    }

    ngOnInit() {
        // Escuchar pedidos activos (no entregados ni pagados)
        this.sub = this.firestoreService
            .getPedidosByEstados(['pendiente', 'en_preparacion', 'listo'])
            .subscribe({
                next: (pedidos) => {
                    // Ordenar por timestamp (más antiguos primero)
                    const sorted = pedidos.sort((a, b) => {
                        const tA = a.timestamp?.seconds ?? 0;
                        const tB = b.timestamp?.seconds ?? 0;
                        return tA - tB;
                    });
                    this.pedidos.set(sorted);
                    this.loading.set(false);
                }
            });
    }

    ngOnDestroy() {
        this.sub?.unsubscribe();
    }

    /** Calcular tiempo transcurrido desde que se hizo el pedido */
    tiempoTranscurrido(timestamp: any): string {
        if (!timestamp?.seconds) return '';
        const ahora = Date.now();
        const creado = timestamp.seconds * 1000;
        const diff = Math.floor((ahora - creado) / 60000); // minutos
        if (diff < 1) return 'Ahora';
        if (diff < 60) return `${diff} min`;
        const horas = Math.floor(diff / 60);
        const mins = diff % 60;
        return `${horas}h ${mins}m`;
    }

    /** Obtener número de mesa (extraer del ID "mesa_01" → "01") */
    mesaNumero(mesaId: string): string {
        return mesaId.replace('mesa_', '');
    }

    /** Aceptar pedido: pendiente → en_preparacion */
    async aceptar(pedido: Order) {
        await this.firestoreService.actualizarEstadoPedido(pedido.id!, 'en_preparacion');
    }

    /** Marcar listo: en_preparacion → listo */
    async marcarListo(pedido: Order) {
        await this.firestoreService.actualizarEstadoPedido(pedido.id!, 'listo');
    }

    /** Deshacer: regresar un estado */
    async deshacer(pedido: Order) {
        if (pedido.estado === 'en_preparacion') {
            await this.firestoreService.actualizarEstadoPedido(pedido.id!, 'pendiente');
        } else if (pedido.estado === 'listo') {
            await this.firestoreService.actualizarEstadoPedido(pedido.id!, 'en_preparacion');
        }
    }

    /** Cerrar sesión */
    async cerrarSesion() {
        await this.authService.logout();
        this.router.navigate(['/login']);
    }
}
