import { apiClient } from '@/shared/api';
import type {
  AnalyticsOverview,
  AnalyticsRangeParams,
  SalesPerDay,
  TopProduct,
  TopProductsParams,
} from '../model/analytics.types';

export async function fetchAnalyticsOverview(params: AnalyticsRangeParams): Promise<AnalyticsOverview> {
  const { data } = await apiClient.get<AnalyticsOverview>('/analytics/overview', { params });
  return data;
}

export async function fetchTopProducts(params: TopProductsParams): Promise<TopProduct[]> {
  const { data } = await apiClient.get<TopProduct[]>('/analytics/top-products', { params });
  return data;
}

export async function fetchSalesPerDay(params: AnalyticsRangeParams): Promise<SalesPerDay[]> {
  const { data } = await apiClient.get<SalesPerDay[]>('/analytics/sales-per-day', { params });
  return data;
}
