import type { AnalyticsRangeParams, TopProductsParams } from './analytics.types';

export const analyticsQueryKeys = {
  all: ['analytics'] as const,
  overview: (params: AnalyticsRangeParams) => [...analyticsQueryKeys.all, 'overview', params] as const,
  topProducts: (params: TopProductsParams) =>
    [...analyticsQueryKeys.all, 'top-products', params] as const,
  salesPerDay: (params: AnalyticsRangeParams) =>
    [...analyticsQueryKeys.all, 'sales-per-day', params] as const,
};
