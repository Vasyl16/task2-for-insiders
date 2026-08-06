import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tokenManager, AUTH_SESSION_EXPIRED_EVENT } from '@/shared/lib';
import type { AuthResponse, User } from '@/shared/types';
import { fetchSession } from '../api/session.api';
import { sessionQueryKeys } from './query-keys';

interface UseSessionResult {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (user: User, accessToken: string) => void;
  updateUser: (patch: Partial<User>) => void;
  clearSession: () => void;
}

/** Session lives entirely in the React Query cache under sessionQueryKeys.bootstrap() — no context. */
export function useSession(): UseSessionResult {
  const queryClient = useQueryClient();

  const { data, isError, isLoading } = useQuery({
    queryKey: sessionQueryKeys.bootstrap(),
    queryFn: fetchSession,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data) {
      tokenManager.setAccessToken(data.accessToken);
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      tokenManager.clearAccessToken();
    }
  }, [isError]);

  const clearSession = useCallback(() => {
    tokenManager.clearAccessToken();
    queryClient.setQueryData<AuthResponse | null>(sessionQueryKeys.bootstrap(), null);
  }, [queryClient]);

  useEffect(() => {
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, clearSession);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, clearSession);
  }, [clearSession]);

  const setSession = useCallback(
    (nextUser: User, accessToken: string) => {
      tokenManager.setAccessToken(accessToken);
      queryClient.setQueryData<AuthResponse>(sessionQueryKeys.bootstrap(), {
        user: nextUser,
        accessToken,
      });
    },
    [queryClient],
  );

  /** Patches the cached user (e.g. after a profile edit) without reissuing tokens. */
  const updateUser = useCallback(
    (patch: Partial<User>) => {
      queryClient.setQueryData<AuthResponse>(sessionQueryKeys.bootstrap(), (old) =>
        old ? { ...old, user: { ...old.user, ...patch } } : old,
      );
    },
    [queryClient],
  );

  return {
    user: data?.user ?? null,
    isAuthenticated: data?.user != null,
    isLoading,
    setSession,
    updateUser,
    clearSession,
  };
}
