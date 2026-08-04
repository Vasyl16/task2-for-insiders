/**
 * Centralized route path constants. Import these instead of hardcoding
 * path strings in <Link>/navigate() calls.
 */
export const paths = {
  home: '/',
  login: '/login',
  register: '/register',
  product: '/products/:productId',
  cart: '/cart',
  checkout: '/checkout',
  profile: '/profile',
  admin: {
    dashboard: '/admin',
    products: '/admin/products',
    categories: '/admin/categories',
    orders: '/admin/orders',
  },
} as const;

export function buildProductPath(productId: string): string {
  return paths.product.replace(':productId', productId);
}
