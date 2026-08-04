import { join } from 'node:path';

export const PRODUCT_IMAGES_DIR = join(process.cwd(), 'uploads', 'products');
export const PRODUCT_IMAGES_URL_PREFIX = '/uploads/products';
export const MAX_PRODUCT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PRODUCT_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
