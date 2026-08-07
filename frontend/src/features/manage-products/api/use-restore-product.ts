import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useToast } from '@/app/providers';
import { productQueryKeys } from '@/entities/product';
import { getErrorMessage } from '@/shared/utils';

export function useRestoreProduct(): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (productId: string) => {
      await apiClient.patch(`/products/${productId}/restore`);
    },
    onSuccess: (_data, productId) => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(productId) });
      toast.success('Product restored.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't restore product. Please try again."));
    },
  });
}
