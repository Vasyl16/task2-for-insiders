import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useToast } from '@/app/providers';
import { useSession } from '@/entities/session';
import { userQueryKeys, type UserProfile } from '@/entities/user';
import { getErrorMessage } from '@/shared/utils';
import type { UpdateProfile } from '../model/schemas';

export function useUpdateProfile(): UseMutationResult<UserProfile, unknown, UpdateProfile> {
  const queryClient = useQueryClient();
  const { updateUser } = useSession();
  const toast = useToast();

  return useMutation({
    mutationFn: async (values: UpdateProfile) => {
      const { data } = await apiClient.patch<UserProfile>('/users/me', values);
      return data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(userQueryKeys.me(), profile);
      updateUser({ email: profile.email });
      toast.success('Profile updated.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't update profile. Please try again."));
    },
  });
}
