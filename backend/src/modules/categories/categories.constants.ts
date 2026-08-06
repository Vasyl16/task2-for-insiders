/** Category list/detail reads are cache-aside in Redis; TTL is a safety net behind explicit invalidation. */
export const CATEGORIES_CACHE_TTL_SECONDS = 300;
export const CATEGORIES_LIST_CACHE_KEY = 'categories:list';

export function categoryDetailCacheKey(id: string): string {
  return `categories:detail:${id}`;
}
