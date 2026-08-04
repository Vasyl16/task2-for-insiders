import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchProductById } from './products.api';
import { productQueryKeys } from '../model/query-keys';
import type { Product } from '../model/product.types';

export function useProduct(id: string | undefined): UseQueryResult<Product> {
  return useQuery({
    queryKey: productQueryKeys.detail(id ?? ''),
    queryFn: () => fetchProductById(id!),
    enabled: Boolean(id),
  });
}
