import type { Role } from '@/shared/types';

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
