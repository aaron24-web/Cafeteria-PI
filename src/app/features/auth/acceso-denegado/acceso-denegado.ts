import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-acceso-denegado',
    imports: [RouterLink],
    template: `
        <div class="page denied-page">
            <div class="denied-card animate-slide-up">
                <div class="denied-icon">🚫</div>
                <h2>Acceso Denegado</h2>
                <p>No tienes permisos para acceder a esta sección.</p>
                <a routerLink="/login" class="btn btn-primary">Volver al login</a>
            </div>
        </div>
    `,
    styles: [`
        .denied-page {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100dvh;
            background: var(--color-bg);
        }
        .denied-card { text-align: center; padding: var(--space-2xl); }
        .denied-icon { font-size: 4rem; margin-bottom: var(--space-md); }
        .denied-card h2 { margin-bottom: var(--space-sm); }
        .denied-card p { color: var(--color-text-secondary); margin-bottom: var(--space-xl); }
    `]
})
export class AccesoDenegadoComponent { }
