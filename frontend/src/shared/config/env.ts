/**
 * Typed accessor for build-time environment variables (import.meta.env).
 * Add new VITE_* variables here as features require them.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
} as const;
