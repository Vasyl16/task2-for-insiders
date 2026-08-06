import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useToast } from '@/app/providers';
import { cartQueryKeys, type Cart } from '@/entities/cart';
import { getErrorMessage } from '@/shared/utils';

interface AddToCartVariables {
  productId: string;
  quantity?: number;
}

export function useAddToCart(): UseMutationResult<Cart, unknown, AddToCartVariables> {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: AddToCartVariables) => {
      const { data } = await apiClient.post<Cart>('/cart/items', { productId, quantity });
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartQueryKeys.detail(), data);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't add item to cart. Please try again."));
    },
  });
}
