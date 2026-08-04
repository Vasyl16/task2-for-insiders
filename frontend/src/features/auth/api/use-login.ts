import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useSession } from '@/entities/session';
import type { AuthResponse } from '@/shared/types';
import type { Login } from '../model/schemas';

export function useLogin(): UseMutationResult<AuthResponse, unknown, Login> {
  const { setSession } = useSession();

  return useMutation({
    mutationFn: async (values: Login) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', values);
      return data;
    },
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
    },
  });
}
