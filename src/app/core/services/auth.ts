import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, docData, collection, query, where, getDocs, setDoc, updateDoc, collectionData } from '@angular/fire/firestore';
import { initializeApp as initRawApp, deleteApp } from 'firebase/app';
import { getAuth as getRawAuth, createUserWithEmailAndPassword, signOut as rawSignOut } from 'firebase/auth';
import { Observable, of, switchMap } from 'rxjs';
import { StaffUser } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Observable del estado de autenticación de Firebase
  user$ = user(this.auth);

  /** Acceso sincrónico al usuario actual */
  get currentUser() { return this.auth.currentUser; }

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

  /**
   * Lee el perfil del staff una sola vez.
   * Busca por email porque los doc IDs pueden no coincidir con el Auth UID.
   */
  async getStaffProfile(email: string): Promise<StaffUser | null> {
    const q = query(
      collection(this.firestore, 'usuarios_staff'),
      where('email', '==', email)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as StaffUser;
  }

  // ─── Admin: Gestión de Usuarios ─────────────────────────────

  /** Obtener todos los usuarios staff en tiempo real */
  getAllStaff(): Observable<StaffUser[]> {
    const ref = collection(this.firestore, 'usuarios_staff');
    return collectionData(ref, { idField: 'id' }) as Observable<StaffUser[]>;
  }

  /**
   * Crear un nuevo usuario staff.
   * Usa una instancia secundaria de Firebase para no deslogear al admin actual.
   */
  async createStaffUser(
    email: string,
    password: string,
    nombre: string,
    rol: StaffUser['rol'],
    pinAcceso: string
  ): Promise<void> {
    // ── Paso 1: Crear usuario en Auth con instancia secundaria ──
    const secondaryApp = initRawApp(environment.firebase, 'UserCreation_' + Date.now());
    const secondaryAuth = getRawAuth(secondaryApp);
    let uid: string;

    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      uid = cred.user.uid;
      console.log('[Admin] ✅ Auth user creado, UID:', uid);

      // Limpiar secundaria inmediatamente
      await rawSignOut(secondaryAuth);
      await deleteApp(secondaryApp);
      console.log('[Admin] ✅ Instancia secundaria cerrada');
    } catch (authErr) {
      console.error('[Admin] ❌ Error en Auth:', authErr);
      try { await deleteApp(secondaryApp); } catch { /* cleanup */ }
      throw authErr;
    }

    // ── Paso 2: Escribir en Firestore (ya sin app secundaria activa) ──
    try {
      console.log('[Admin] Escribiendo en Firestore, doc:', `usuarios_staff/${uid}`);
      console.log('[Admin] Admin actual:', this.auth.currentUser?.email);

      await setDoc(doc(this.firestore, `usuarios_staff/${uid}`), {
        uid,
        nombre,
        email,
        rol,
        pin_acceso: pinAcceso,
        activo: true,
        fecha_ingreso: new Date()
      });

      console.log('[Admin] ✅ Documento creado en Firestore');
    } catch (fsErr: any) {
      console.error('[Admin] ❌ Error Firestore code:', fsErr.code);
      console.error('[Admin] ❌ Error Firestore msg:', fsErr.message);
      console.error('[Admin] ❌ Error Firestore full:', fsErr);
      throw fsErr;
    }
  }

  /** Actualizar rol de un usuario */
  async updateStaffRole(docId: string, rol: StaffUser['rol']): Promise<void> {
    await updateDoc(doc(this.firestore, `usuarios_staff/${docId}`), { rol });
  }

  /** Activar/desactivar un usuario */
  async toggleStaffActive(docId: string, activo: boolean): Promise<void> {
    await updateDoc(doc(this.firestore, `usuarios_staff/${docId}`), { activo });
  }
}
