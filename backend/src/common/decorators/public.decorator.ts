import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route (or an entire controller) as exempt from the global
 * JwtAuthGuard. Use on auth endpoints (register/login/refresh/logout) and
 * on infrastructure endpoints like /health.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
