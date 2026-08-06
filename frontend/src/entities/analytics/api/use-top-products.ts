import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchTopProducts } from './analytics.api';
import { analyticsQueryKeys } from '../model/query-keys';
import type { TopProduct, TopProductsParams } from '../model/analytics.types';

export function useTopProducts(params: TopProductsParams): UseQueryResult<TopProduct[]> {
  return useQuery({
    queryKey: analyticsQueryKeys.topProducts(params),
    queryFn: () => fetchTopProducts(params),
  });
}
