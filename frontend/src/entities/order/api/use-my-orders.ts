import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchMyOrders } from './orders.api';
import { orderQueryKeys } from '../model/query-keys';
import type { OrderListResponse, OrdersQueryParams } from '../model/order.types';

export function useMyOrders(params: OrdersQueryParams): UseQueryResult<OrderListResponse> {
  return useQuery({
    queryKey: orderQueryKeys.mineList(params),
    queryFn: () => fetchMyOrders(params),
    placeholderData: keepPreviousData,
  });
}
