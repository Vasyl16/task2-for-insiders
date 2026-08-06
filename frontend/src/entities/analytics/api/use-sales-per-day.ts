import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchSalesPerDay } from './analytics.api';
import { analyticsQueryKeys } from '../model/query-keys';
import type { AnalyticsRangeParams, SalesPerDay } from '../model/analytics.types';

export function useSalesPerDay(params: AnalyticsRangeParams): UseQueryResult<SalesPerDay[]> {
  return useQuery({
    queryKey: analyticsQueryKeys.salesPerDay(params),
    queryFn: () => fetchSalesPerDay(params),
  });
}
