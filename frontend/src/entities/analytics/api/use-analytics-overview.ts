import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchAnalyticsOverview } from './analytics.api';
import { analyticsQueryKeys } from '../model/query-keys';
import type { AnalyticsOverview, AnalyticsRangeParams } from '../model/analytics.types';

export function useAnalyticsOverview(params: AnalyticsRangeParams): UseQueryResult<AnalyticsOverview> {
  return useQuery({
    queryKey: analyticsQueryKeys.overview(params),
    queryFn: () => fetchAnalyticsOverview(params),
  });
}
