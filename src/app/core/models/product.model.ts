export interface Product {
    id?: string;
    nombre: string;
    precio: number;
    descripcion: string;
    categoria_id: string;
    imagen_url?: string;
    disponible: boolean;
}
