import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  errorMsg = '';

  async onSubmit() {
    if (!this.loginForm.valid) return;

    this.loading = true;
    this.errorMsg = '';
    const { email, password } = this.loginForm.value;

    try {
      const cred = await this.authService.login(email!, password!);

      // Buscar perfil del staff por email (los doc IDs no coinciden con Auth UIDs)
      const profile = await this.authService.getStaffProfile(cred.user.email!);

      if (!profile) {
        this.errorMsg = 'No se encontró tu perfil de staff.';
        await this.authService.logout();
        this.loading = false;
        return;
      }

      if (!profile.activo) {
        this.errorMsg = 'Tu cuenta está desactivada. Contacta al administrador.';
        await this.authService.logout();
        this.loading = false;
        return;
      }

      // Redirigir según rol
      switch (profile.rol) {
        case 'cocina':
          this.router.navigate(['/cocina']);
          break;
        case 'cajero':
          this.router.navigate(['/cajero']);
          break;
        case 'mesero':
          this.router.navigate(['/cajero']);
          break;
        case 'admin':
          this.router.navigate(['/admin/usuarios']);
          break;
        default:
          this.router.navigate(['/login']);
      }
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        this.errorMsg = 'Correo o contraseña incorrectos.';
      } else if (error.code === 'auth/user-not-found') {
        this.errorMsg = 'No existe una cuenta con este correo.';
      } else {
        this.errorMsg = 'Error al iniciar sesión. Intenta de nuevo.';
      }
      this.loading = false;
    }
  }
}
