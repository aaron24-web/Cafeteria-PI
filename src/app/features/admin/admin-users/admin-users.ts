import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { StaffUser } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-users',
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-users.html',
    styleUrl: './admin-users.css'
})
export class AdminUsersComponent implements OnInit, OnDestroy {
    private authService = inject(AuthService);
    private router = inject(Router);
    private sub!: Subscription;

    // ─── Estado ─────────────────────────────────────────────────
    users = signal<StaffUser[]>([]);
    loading = signal(true);
    showForm = signal(false);
    saving = signal(false);
    errorMsg = signal('');
    successMsg = signal('');

    // ─── Formulario nuevo usuario ───────────────────────────────
    newUser = {
        nombre: '',
        email: '',
        password: '',
        rol: 'cocina' as StaffUser['rol'],
        pinAcceso: ''
    };

    roles: { value: StaffUser['rol']; label: string }[] = [
        { value: 'admin', label: 'Administrador' },
        { value: 'cocina', label: 'Cocina' },
        { value: 'cajero', label: 'Cajero' },
        { value: 'mesero', label: 'Mesero' },
    ];

    ngOnInit() {
        this.sub = this.authService.getAllStaff().subscribe({
            next: (users) => {
                const sorted = users.sort((a, b) => a.nombre.localeCompare(b.nombre));
                this.users.set(sorted);
                this.loading.set(false);
            }
        });
    }

    ngOnDestroy() {
        this.sub?.unsubscribe();
    }

    // ─── Acciones ───────────────────────────────────────────────

    toggleForm() {
        this.showForm.update(v => !v);
        this.errorMsg.set('');
        this.successMsg.set('');
    }

    async crearUsuario() {
        const { nombre, email, password, rol, pinAcceso } = this.newUser;

        if (!nombre || !email || !password || !pinAcceso) {
            this.errorMsg.set('Todos los campos son obligatorios.');
            return;
        }

        if (password.length < 6) {
            this.errorMsg.set('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        this.saving.set(true);
        this.errorMsg.set('');

        try {
            await this.authService.createStaffUser(email, password, nombre, rol, pinAcceso);
            this.successMsg.set(`✅ Usuario "${nombre}" creado exitosamente.`);
            this.newUser = { nombre: '', email: '', password: '', rol: 'cocina', pinAcceso: '' };
            // Hide form after success
            setTimeout(() => {
                this.showForm.set(false);
                this.successMsg.set('');
            }, 2000);
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                this.errorMsg.set('Ya existe un usuario con ese correo.');
            } else {
                this.errorMsg.set('Error al crear usuario: ' + (err.message || err));
            }
        } finally {
            this.saving.set(false);
        }
    }

    async cambiarRol(user: StaffUser, nuevoRol: StaffUser['rol']) {
        const docId = (user as any).id || user.uid;
        await this.authService.updateStaffRole(docId, nuevoRol);
    }

    async toggleActivo(user: StaffUser) {
        const docId = (user as any).id || user.uid;
        await this.authService.toggleStaffActive(docId, !user.activo);
    }

    getRolIcon(rol: string): string {
        switch (rol) {
            case 'admin': return '👑';
            case 'cocina': return '👨‍🍳';
            case 'cajero': return '🧑‍💼';
            case 'mesero': return '🍽';
            default: return '👤';
        }
    }

    async cerrarSesion() {
        await this.authService.logout();
        this.router.navigate(['/login']);
    }
}
