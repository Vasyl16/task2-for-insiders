import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useSession } from '@/entities/session';
import type { AuthResponse } from '@/shared/types';
import type { Register } from '../model/schemas';

export function useRegister(): UseMutationResult<AuthResponse, unknown, Register> {
  const { setSession } = useSession();

  return useMutation({
    mutationFn: async ({ email, password, confirmPassword }: Register) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', {
        email,
        password,
        confirmPassword,
      });
      return data;
    },
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
    },
  });
}
