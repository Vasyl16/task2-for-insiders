import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import { useToast } from '@/app/providers';
import { getErrorMessage } from '@/shared/utils';
import { env } from '@/shared/config';

/** Uploads a product image and returns a fully-qualified URL to store as imageUrl. */
export function useUploadProductImage(): UseMutationResult<string, unknown, File> {
  const toast = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post<{ url: string }>('/products/images', formData);
      return new URL(data.url, env.apiOrigin).toString();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't upload image. Please try again."));
    },
  });
}
