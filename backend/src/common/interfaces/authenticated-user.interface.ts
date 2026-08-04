import type { Role } from '@prisma/client';

/** Shape attached to `request.user` by JwtStrategy after a valid access token. */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
}
