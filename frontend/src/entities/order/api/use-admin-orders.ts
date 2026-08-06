import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchAdminOrders } from './orders.api';
import { orderQueryKeys } from '../model/query-keys';
import type { OrderListResponse, OrdersQueryParams } from '../model/order.types';

export function useAdminOrders(params: OrdersQueryParams): UseQueryResult<OrderListResponse> {
  return useQuery({
    queryKey: orderQueryKeys.adminList(params),
    queryFn: () => fetchAdminOrders(params),
    placeholderData: keepPreviousData,
  });
}
