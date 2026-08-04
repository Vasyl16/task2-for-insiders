export const cartQueryKeys = {
  all: ['cart'] as const,
  detail: () => [...cartQueryKeys.all, 'detail'] as const,
};
