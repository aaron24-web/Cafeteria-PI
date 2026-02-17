export interface Product {
    id?: string;
    name: string;
    price: number;
    description: string;
    category_id: string;
    image_url?: string;
    available: boolean;
}
