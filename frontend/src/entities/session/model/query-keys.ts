export const sessionQueryKeys = {
  all: ['session'] as const,
  bootstrap: () => [...sessionQueryKeys.all, 'bootstrap'] as const,
};
