export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  stock: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
  lineTotal: number;
}

export interface Cart {
  id: string | null;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}
