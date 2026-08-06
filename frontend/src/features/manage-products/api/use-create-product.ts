import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useToast } from '@/app/providers';
import { productQueryKeys, type Product } from '@/entities/product';
import { getErrorMessage } from '@/shared/utils';
import type { ProductForm } from '../model/schemas';

export function useCreateProduct(): UseMutationResult<Product, unknown, ProductForm> {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (values: ProductForm) => {
      const { data } = await apiClient.post<Product>('/products', values);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      toast.success('Product created.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't create product. Please try again."));
    },
  });
}
