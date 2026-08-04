import { SetMetadata } from '@nestjs/common';
import type { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to the given roles. Must be combined with `RolesGuard`
 * (`@UseGuards(RolesGuard)`) — it only has an effect where that guard runs.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
