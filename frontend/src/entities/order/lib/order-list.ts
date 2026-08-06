import type { Order, OrderListResponse, OrderStatus } from '../model/order.types';

export function withUpdatedOrderStatus(
  list: OrderListResponse,
  orderId: string,
  status: OrderStatus,
): OrderListResponse {
  const items = list.items.map((order: Order) =>
    order.id === orderId ? { ...order, status } : order,
  );
  return { ...list, items };
}
