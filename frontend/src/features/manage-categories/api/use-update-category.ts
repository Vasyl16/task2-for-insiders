import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useToast } from '@/app/providers';
import { categoryQueryKeys, type Category } from '@/entities/category';
import { getErrorMessage } from '@/shared/utils';
import type { CategoryForm } from '../model/schemas';

interface UpdateCategoryVariables {
  categoryId: string;
  values: CategoryForm;
}

export function useUpdateCategory(): UseMutationResult<Category, unknown, UpdateCategoryVariables> {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ categoryId, values }: UpdateCategoryVariables) => {
      const { data } = await apiClient.patch<Category>(`/categories/${categoryId}`, values);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });
      toast.success('Category updated.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't update category. Please try again."));
    },
  });
}
