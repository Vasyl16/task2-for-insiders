import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useToast } from '@/app/providers';
import { productQueryKeys, type Product } from '@/entities/product';
import { getErrorMessage } from '@/shared/utils';
import type { ProductForm } from '../model/schemas';

interface UpdateProductVariables {
  productId: string;
  values: ProductForm;
}

export function useUpdateProduct(): UseMutationResult<Product, unknown, UpdateProductVariables> {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ productId, values }: UpdateProductVariables) => {
      const { data } = await apiClient.patch<Product>(`/products/${productId}`, values);
      return data;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      queryClient.setQueryData(productQueryKeys.detail(product.id), product);
      toast.success('Product updated.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't update product. Please try again."));
    },
  });
}
