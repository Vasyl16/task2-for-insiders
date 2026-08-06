import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useToast } from '@/app/providers';
import { productQueryKeys } from '@/entities/product';
import { getErrorMessage } from '@/shared/utils';

export function useDeleteProduct(): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (productId: string) => {
      await apiClient.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      toast.success('Product deleted.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't delete product. Please try again."));
    },
  });
}
