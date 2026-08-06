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
  userId: string;
  /** Only populated by the admin order list/detail endpoints. */
  customerEmail?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  status: OrderStatus;
  reason: string | null;
  changedBy: string | null;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderListResponse {
  items: Order[];
  meta: PaginationMeta;
}

export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}
