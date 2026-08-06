import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useToast } from '@/app/providers';
import { getErrorMessage } from '@/shared/utils';
import type { ChangePassword } from '../model/schemas';

export function useChangePassword(): UseMutationResult<void, unknown, ChangePassword> {
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: ChangePassword) => {
      await apiClient.patch('/users/me/password', { currentPassword, newPassword });
    },
    onSuccess: () => {
      toast.success('Password changed.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't change password. Please try again."));
    },
  });
}
