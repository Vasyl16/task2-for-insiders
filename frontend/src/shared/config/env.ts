const apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

/**
 * Typed accessor for build-time environment variables (import.meta.env).
 * Add new VITE_* variables here as features require them.
 */
export const env = {
  apiBaseUrl,
  /** Origin only (no /api suffix) — static assets like uploaded images are served outside the API prefix. */
  apiOrigin: new URL(apiBaseUrl).origin,
} as const;
