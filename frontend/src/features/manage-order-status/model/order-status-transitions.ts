import type { OrderStatus } from '@/entities/order';

/**
 * Client-side mirror of the backend's transition rules, used only to decide
 * which action buttons to offer — the backend is still the source of truth
 * and re-validates on every request.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};
