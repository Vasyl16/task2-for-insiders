import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchOrderHistory } from './orders.api';
import { orderQueryKeys } from '../model/query-keys';
import type { OrderStatusHistoryEntry } from '../model/order.types';

export function useOrderHistory(
  orderId: string | undefined,
  enabled = true,
): UseQueryResult<OrderStatusHistoryEntry[]> {
  return useQuery({
    queryKey: orderQueryKeys.history(orderId ?? ''),
    queryFn: () => fetchOrderHistory(orderId as string),
    enabled: Boolean(orderId) && enabled,
  });
}
