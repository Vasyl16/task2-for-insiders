import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { cartQueryKeys, type Cart } from '@/entities/cart';
import type { Order } from '@/entities/order';

export function useCheckout(): UseMutationResult<Order, unknown, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<Order>('/orders');
      return data;
    },
    onSuccess: () => {
      // Checkout empties the cart server-side; reflect that immediately
      // instead of waiting on a refetch.
      queryClient.setQueryData<Cart>(cartQueryKeys.detail(), {
        id: null,
        items: [],
        totalItems: 0,
        subtotal: 0,
      });
    },
  });
}
