import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { cartQueryKeys, type Cart } from '@/entities/cart';

interface AddToCartVariables {
  productId: string;
  quantity?: number;
}

export function useAddToCart(): UseMutationResult<Cart, unknown, AddToCartVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: AddToCartVariables) => {
      const { data } = await apiClient.post<Cart>('/cart/items', { productId, quantity });
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartQueryKeys.detail(), data);
    },
  });
}
