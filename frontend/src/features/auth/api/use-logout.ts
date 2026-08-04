import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useSession } from '@/entities/session';

export function useLogout(): UseMutationResult<void, unknown, void> {
  const { clearSession } = useSession();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSettled: () => {
      clearSession();
    },
  });
}
