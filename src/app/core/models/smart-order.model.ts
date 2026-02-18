// ─── Colección A: configuracion_negocio ────────────────────
export interface BusinessConfig {
    nombre_comercial: string;
    direccion: string;
    telefono: string;
    moneda: string;
    iva_porcentaje: number;
    horario_atencion: string;
}

// ─── Colección B: categorias ────────────────────────────────
export interface Categoria {
    id?: string;
    nombre: string;
    orden_visual: number;
    icono_url?: string;
    activa: boolean;
}

// ─── Colección D: modificadores_productos ───────────────────
export interface ModificadorOpcion {
    id: string;
    nombre: string;
    precio_adicional: number;
}

export interface ModificadorGrupo {
    id?: string;
    producto_id: string;
    nombre: string;
    obligatorio: boolean;
    seleccion_multiple: boolean;
    opciones: ModificadorOpcion[];
    activo: boolean;
}

// ─── Colección E: mesas ─────────────────────────────────────
export interface Mesa {
    id?: string;
    numero: number;
    estado: 'libre' | 'ocupada' | 'sucia';
    pedido_activo_id?: string | null;
}

// ─── Colección F: pedidos ───────────────────────────────────
export interface ModificadorAplicado {
    grupo_id: string;
    opcion_id: string;
    nombre: string;
    precio_adicional_snapshot: number;
}

export interface OrderItem {
    producto_id: string;
    nombre: string;
    precio_snapshot: number;
    cantidad: number;
    especificaciones: string;
    modificadores_aplicados: ModificadorAplicado[];
}

export interface DescuentoAplicado {
    descuento_id: string;
    nombre: string;
    monto_descontado: number;
}

export interface Order {
    id?: string;
    mesa_id: string;
    cliente_uid: string;
    atendido_por_id: string;
    cocinado_por_id: string;
    estado: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'pagado';
    items: OrderItem[];
    descuento_aplicado?: DescuentoAplicado | null;
    subtotal: number;
    total: number;
    timestamp: Date | any;
}
