import { apiClient } from '@/shared/api';
import type { OrderListResponse, OrderStatusHistoryEntry, OrdersQueryParams } from '../model/order.types';

export async function fetchMyOrders(params: OrdersQueryParams): Promise<OrderListResponse> {
  const { data } = await apiClient.get<OrderListResponse>('/orders', { params });
  return data;
}

export async function fetchAdminOrders(params: OrdersQueryParams): Promise<OrderListResponse> {
  const { data } = await apiClient.get<OrderListResponse>('/orders/admin', { params });
  return data;
}

export async function fetchOrderHistory(orderId: string): Promise<OrderStatusHistoryEntry[]> {
  const { data } = await apiClient.get<OrderStatusHistoryEntry[]>(`/orders/${orderId}/history`);
  return data;
}
