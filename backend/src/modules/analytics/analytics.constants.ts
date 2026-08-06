/**
 * Analytics reads are cache-aside in Redis, same pattern as products/categories.
 * TTL is short since the admin dashboard wants reasonably fresh numbers, but
 * correctness ultimately comes from explicit invalidation (see
 * OrdersService.checkout/updateStatus) whenever an order is created or its
 * status changes, since both affect revenue/counts.
 */
export const ANALYTICS_CACHE_TTL_SECONDS = 120;
export const ANALYTICS_CACHE_PATTERN = 'analytics:*';

export const DEFAULT_ANALYTICS_RANGE_DAYS = 30;
export const DEFAULT_TOP_PRODUCTS_LIMIT = 10;
export const MAX_TOP_PRODUCTS_LIMIT = 50;

export function analyticsOverviewCacheKey(from: Date, to: Date): string {
  return `analytics:overview:${from.toISOString()}:${to.toISOString()}`;
}

export function analyticsTopProductsCacheKey(from: Date, to: Date, limit: number): string {
  return `analytics:top-products:${from.toISOString()}:${to.toISOString()}:${limit}`;
}

export function analyticsSalesPerDayCacheKey(from: Date, to: Date): string {
  return `analytics:sales-per-day:${from.toISOString()}:${to.toISOString()}`;
}
