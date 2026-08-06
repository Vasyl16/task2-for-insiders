import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useToast } from '@/app/providers';
import { cartQueryKeys, withRemovedItem, type Cart } from '@/entities/cart';
import { getErrorMessage } from '@/shared/utils';

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
  const toast = useToast();

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
    onError: (error, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKeys.detail(), context.previousCart);
      }
      toast.error(getErrorMessage(error, "Couldn't remove item. Please try again."));
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartQueryKeys.detail(), data);
    },
  });
}
