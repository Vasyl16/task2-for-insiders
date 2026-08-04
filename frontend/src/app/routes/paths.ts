/**
 * Centralized route path constants. Import these instead of hardcoding
 * path strings in <Link>/navigate() calls.
 */
export const paths = {
  home: '/',
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
