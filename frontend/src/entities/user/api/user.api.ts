import { apiClient } from '@/shared/api';
import type { UserProfile } from '../model/user.types';

export async function fetchMyProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>('/users/me');
  return data;
}
