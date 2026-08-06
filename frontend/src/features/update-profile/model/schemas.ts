import { z } from 'zod';

export const updateProfileSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
