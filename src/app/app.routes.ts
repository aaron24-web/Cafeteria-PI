import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // ─── Auth (Staff) ───────────────────────────────────────
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
    },
    {
        path: 'acceso-denegado',
        loadComponent: () => import('./features/auth/acceso-denegado/acceso-denegado').then(m => m.AccesoDenegadoComponent)
    },

    // ─── Cliente (Flujo desde QR — sin auth) ────────────────
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

    // ─── Staff: Cocina (requiere rol cocina o admin) ────────
    {
        path: 'cocina',
        canActivate: [authGuard, roleGuard('cocina', 'admin')],
        loadComponent: () => import('./features/cocina/cocina-dashboard/cocina-dashboard').then(m => m.CocinaDashboardComponent)
    },

    // ─── Staff: Cajero (requiere rol cajero o admin) ────────
    {
        path: 'cajero',
        canActivate: [authGuard, roleGuard('cajero', 'admin')],
        loadComponent: () => import('./features/cajero/cajero-dashboard/cajero-dashboard').then(m => m.CajeroDashboardComponent)
    },

    // ─── Admin (requiere rol admin) ─────────────────────────
    {
        path: 'admin/usuarios',
        canActivate: [authGuard, roleGuard('admin')],
        loadComponent: () => import('./features/admin/admin-users/admin-users').then(m => m.AdminUsersComponent)
    },

    // ─── Legacy ─────────────────────────────────────────────
    {
        path: 'menu',
        loadComponent: () => import('./features/menu/product-list/product-list').then(m => m.ProductListComponent)
    },

    // ─── Default ────────────────────────────────────────────
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
