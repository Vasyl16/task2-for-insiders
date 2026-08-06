import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
});
export type CategoryForm = z.infer<typeof categoryFormSchema>;
