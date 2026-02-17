export interface StaffUser {
    uid: string;
    nombre: string;
    email: string;
    rol: 'admin' | 'cocina' | 'mesero' | 'cajero';
    activo: boolean;
}
