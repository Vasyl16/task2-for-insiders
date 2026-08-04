/** Mirrors the backend's Prisma `Role` enum (backend/prisma/schema.prisma). */
export type Role = 'USER' | 'ADMIN';

/** Mirrors the backend's UserResponseDto (backend/src/modules/auth/dto/auth-response.dto.ts). */
export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

/** Mirrors the backend's AuthResponseDto — the shape of register/login/refresh responses. */
export interface AuthResponse {
  user: User;
  accessToken: string;
}
