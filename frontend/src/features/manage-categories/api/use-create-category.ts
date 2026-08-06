import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useToast } from '@/app/providers';
import { categoryQueryKeys, type Category } from '@/entities/category';
import { getErrorMessage } from '@/shared/utils';
import type { CategoryForm } from '../model/schemas';

export function useCreateCategory(): UseMutationResult<Category, unknown, CategoryForm> {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (values: CategoryForm) => {
      const { data } = await apiClient.post<Category>('/categories', values);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });
      toast.success('Category created.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't create category. Please try again."));
    },
  });
}
