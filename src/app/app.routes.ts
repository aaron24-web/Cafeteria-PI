import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
    },
    {
        path: 'menu',
        loadComponent: () => import('./features/menu/product-list/product-list').then(m => m.ProductListComponent)
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
