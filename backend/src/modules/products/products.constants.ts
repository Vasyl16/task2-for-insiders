import { join } from 'node:path';
import type { ProductsQueryDto } from './dto';

export const PRODUCT_IMAGES_DIR = join(process.cwd(), 'uploads', 'products');
export const PRODUCT_IMAGES_URL_PREFIX = '/uploads/products';
export const MAX_PRODUCT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PRODUCT_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Product reads (list/detail) are cache-aside in Redis. The TTL is only a
 * safety net — correctness comes from explicit invalidation on every write
 * (create/update/delete here, plus checkout's stock decrement and category
 * renames, since a product's response embeds its category).
 */
export const PRODUCTS_CACHE_TTL_SECONDS = 300;
export const PRODUCTS_LIST_CACHE_PATTERN = 'products:list:*';

export function productListCacheKey(
  query: ProductsQueryDto,
  isActive: boolean | undefined,
): string {
  const { page, limit, categoryId, search, minPrice, maxPrice, sortBy, sortOrder } = query;
  const activeSegment = isActive === undefined ? 'all' : String(isActive);
  return `products:list:${page}:${limit}:${categoryId ?? ''}:${search ?? ''}:${minPrice ?? ''}:${maxPrice ?? ''}:${sortBy}:${sortOrder}:${activeSegment}`;
}

export function productDetailCacheKey(id: string): string {
  return `products:detail:${id}`;
}
