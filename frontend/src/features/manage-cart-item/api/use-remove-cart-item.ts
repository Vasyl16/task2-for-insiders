import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { cartQueryKeys, withRemovedItem, type Cart } from '@/entities/cart';

interface RemoveCartItemVariables {
  itemId: string;
}

interface MutationContext {
  previousCart?: Cart;
}

export function useRemoveCartItem(): UseMutationResult<
  Cart,
  unknown,
  RemoveCartItemVariables,
  MutationContext
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId }: RemoveCartItemVariables) => {
      const { data } = await apiClient.delete<Cart>(`/cart/items/${itemId}`);
      return data;
    },
    onMutate: async ({ itemId }) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKeys.detail() });
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKeys.detail());

      if (previousCart) {
        queryClient.setQueryData(cartQueryKeys.detail(), withRemovedItem(previousCart, itemId));
      }

      return { previousCart };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKeys.detail(), context.previousCart);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartQueryKeys.detail(), data);
    },
  });
}
