import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs';

/**
 * Guard que verifica si el usuario está autenticado.
 * Si no está logueado, redirige a /login.
 */
export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.user$.pipe(
        take(1),
        map(user => {
            if (user) return true;
            router.navigate(['/login']);
            return false;
        })
    );
};

/**
 * Fábrica de guard que verifica si el usuario tiene uno de los roles permitidos.
 * Busca por email en Firestore porque los doc IDs no coinciden con Auth UIDs.
 */
export function roleGuard(...rolesPermitidos: string[]): CanActivateFn {
    return async () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        // Obtener el usuario actual de Firebase Auth
        const currentUser = authService.currentUser;
        if (!currentUser?.email) {
            router.navigate(['/login']);
            return false;
        }

        // Buscar el perfil por email (one-shot)
        const profile = await authService.getStaffProfile(currentUser.email);

        if (profile && rolesPermitidos.includes(profile.rol)) {
            return true;
        }

        if (profile) {
            router.navigate(['/acceso-denegado']);
        } else {
            router.navigate(['/login']);
        }
        return false;
    };
}
