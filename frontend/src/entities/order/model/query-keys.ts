import type { OrdersQueryParams } from './order.types';

export const orderQueryKeys = {
  all: ['orders'] as const,
  mine: () => [...orderQueryKeys.all, 'mine'] as const,
  mineList: (params: OrdersQueryParams) => [...orderQueryKeys.mine(), params] as const,
  admin: () => [...orderQueryKeys.all, 'admin'] as const,
  adminList: (params: OrdersQueryParams) => [...orderQueryKeys.admin(), params] as const,
  history: (orderId: string) => [...orderQueryKeys.all, 'history', orderId] as const,
};
