import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useToast } from '@/app/providers';
import {
  orderQueryKeys,
  withUpdatedOrderStatus,
  type Order,
  type OrderListResponse,
  type OrderStatus,
} from '@/entities/order';
import { getErrorMessage } from '@/shared/utils';

interface UpdateOrderStatusVariables {
  orderId: string;
  status: OrderStatus;
  reason?: string;
}

interface MutationContext {
  previousLists: Array<[readonly unknown[], OrderListResponse | undefined]>;
}

export function useUpdateOrderStatus(): UseMutationResult<
  Order,
  unknown,
  UpdateOrderStatusVariables,
  MutationContext
> {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ orderId, status, reason }: UpdateOrderStatusVariables) => {
      const { data } = await apiClient.patch<Order>(`/orders/${orderId}/status`, { status, reason });
      return data;
    },
    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey: orderQueryKeys.admin() });

      const previousLists = queryClient.getQueriesData<OrderListResponse>({
        queryKey: orderQueryKeys.admin(),
      });

      previousLists.forEach(([queryKey, data]) => {
        if (data) {
          queryClient.setQueryData(queryKey, withUpdatedOrderStatus(data, orderId, status));
        }
      });

      return { previousLists };
    },
    onError: (error, _variables, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(getErrorMessage(error, "Couldn't update order status. Please try again."));
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.history(order.id) });
    },
  });
}
