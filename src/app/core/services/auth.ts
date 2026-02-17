import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { StaffUser } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Observable del estado de autenticación de Firebase
  user$ = user(this.auth);

  /**
   * Obtiene los datos del perfil del staff (incluyendo el rol)
   * desde la colección 'usuarios_staff'
   */
  get staffProfile$(): Observable<StaffUser | null> {
    return this.user$.pipe(
      switchMap(firebaseUser => {
        if (!firebaseUser) return of(null);
        const userRef = doc(this.firestore, `usuarios_staff/${firebaseUser.uid}`);
        return docData(userRef) as Observable<StaffUser>;
      })
    );
  }

  // Iniciar sesión con correo y contraseña
  async login(email: string, pass: string) {
    return await signInWithEmailAndPassword(this.auth, email, pass);
  }

  // Cerrar sesión
  async logout() {
    await signOut(this.auth);
  }
}
