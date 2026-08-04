import { apiClient } from '@/shared/api';
import type { AuthResponse } from '@/shared/types';

/** Bootstraps a session from the httpOnly refresh cookie (called once on app load). */
export async function fetchSession(): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/refresh');
  return data;
}
