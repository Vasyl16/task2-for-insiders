import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchProducts } from './products.api';
import { productQueryKeys } from '../model/query-keys';
import type { ProductListResponse, ProductsQueryParams } from '../model/product.types';

export function useProducts(params: ProductsQueryParams): UseQueryResult<ProductListResponse> {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
  });
}
