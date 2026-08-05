export type OrderStatus = 'NEW' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  cancelReason: string | null;
  items: OrderItem[];
  createdAt: string;
}

