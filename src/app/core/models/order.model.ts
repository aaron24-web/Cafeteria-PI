export interface OrderItem {
    product_id: string;
    name: string;
    price_snapshot: number;
    quantity: number;
    notes?: string;
}

export interface Order {
    id?: string;
    table_id: string;
    status: 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'pagado';
    items: OrderItem[];
    total: number;
    created_at: any; // Timestamp de Firestore
}
