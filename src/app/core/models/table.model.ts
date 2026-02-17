export interface Table {
    id: string; // Ejemplo: 'mesa_1'
    number: number;
    status: 'libre' | 'ocupada' | 'sucia';
    current_order_id?: string | null;
}
