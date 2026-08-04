/**
 * In-memory access-token store. Deliberately not persisted (no
 * localStorage/sessionStorage) — the access token is short-lived and
 * reduces XSS blast radius by living only in JS memory. Session persistence
 * across reloads is handled separately via the httpOnly refresh cookie (see
 * `entities/session`), not by this store.
 */
let accessToken: string | null = null;

export const tokenManager = {
  getAccessToken: (): string | null => accessToken,
  setAccessToken: (token: string): void => {
    accessToken = token;
  },
  clearAccessToken: (): void => {
    accessToken = null;
  },
};
