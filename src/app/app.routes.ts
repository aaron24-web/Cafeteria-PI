import { Routes } from '@angular/router';

export const routes: Routes = [
    // ─── Auth (Staff) ───────────────────────────────────────
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
    },

    // ─── Cliente (Flujo desde QR) ───────────────────────────
    {
        path: 'mesa/:mesaId',
        loadComponent: () => import('./features/cliente/mesa-entry/mesa-entry').then(m => m.MesaEntryComponent)
    },
    {
        path: 'mesa/:mesaId/menu',
        loadComponent: () => import('./features/cliente/menu-categorias/menu-categorias').then(m => m.MenuCategoriasComponent)
    },
    {
        path: 'mesa/:mesaId/carrito',
        loadComponent: () => import('./features/cliente/cart/cart').then(m => m.CartComponent)
    },
    {
        path: 'mesa/:mesaId/pedido/:pedidoId',
        loadComponent: () => import('./features/cliente/order-status/order-status').then(m => m.OrderStatusComponent)
    },

    // ─── Legacy (se mantiene por ahora) ─────────────────────
    {
        path: 'menu',
        loadComponent: () => import('./features/menu/product-list/product-list').then(m => m.ProductListComponent)
    },

    // ─── Staff: Cocina ──────────────────────────────────────
    {
        path: 'cocina',
        loadComponent: () => import('./features/cocina/cocina-dashboard/cocina-dashboard').then(m => m.CocinaDashboardComponent)
    },

    // ─── Staff: Cajero ──────────────────────────────────────
    {
        path: 'cajero',
        loadComponent: () => import('./features/cajero/cajero-dashboard/cajero-dashboard').then(m => m.CajeroDashboardComponent)
    },

    // ─── Default ────────────────────────────────────────────
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
