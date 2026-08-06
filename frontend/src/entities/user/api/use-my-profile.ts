import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchMyProfile } from './user.api';
import { userQueryKeys } from '../model/query-keys';
import type { UserProfile } from '../model/user.types';

export function useMyProfile(): UseQueryResult<UserProfile> {
  return useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: fetchMyProfile,
  });
}
