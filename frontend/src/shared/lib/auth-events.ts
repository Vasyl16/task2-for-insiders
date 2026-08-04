/**
 * DOM event dispatched when the axios response interceptor gives up on
 * refreshing the session (refresh call itself failed/401'd). Lets
 * `entities/session` react (clear its user state) without `shared/api`
 * importing upward into `entities` — layering stays one-directional.
 */
export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';
