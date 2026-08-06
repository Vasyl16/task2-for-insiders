import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useToast } from '@/app/providers';
import { categoryQueryKeys } from '@/entities/category';
import { getErrorMessage } from '@/shared/utils';

export function useDeleteCategory(): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      await apiClient.delete(`/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });
      toast.success('Category deleted.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't delete category. Please try again."));
    },
  });
}
