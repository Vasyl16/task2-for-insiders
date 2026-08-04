import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { cartQueryKeys, withUpdatedItemQuantity, type Cart } from '@/entities/cart';

interface UpdateCartItemVariables {
  itemId: string;
  quantity: number;
}

interface MutationContext {
  previousCart?: Cart;
}

export function useUpdateCartItem(): UseMutationResult<
  Cart,
  unknown,
  UpdateCartItemVariables,
  MutationContext
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: UpdateCartItemVariables) => {
      const { data } = await apiClient.patch<Cart>(`/cart/items/${itemId}`, { quantity });
      return data;
    },
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKeys.detail() });
      const previousCart = queryClient.getQueryData<Cart>(cartQueryKeys.detail());

      if (previousCart) {
        queryClient.setQueryData(
          cartQueryKeys.detail(),
          withUpdatedItemQuantity(previousCart, itemId, quantity),
        );
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
