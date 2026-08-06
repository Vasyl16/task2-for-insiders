import { z } from 'zod';

export const productFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(150, 'Name must be at most 150 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  price: z.coerce.number().min(0, 'Price must be at least 0').max(1_000_000, 'Price is too large'),
  stock: z.coerce
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock must be at least 0'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().min(1, 'Upload an image').max(2048),
});
export type ProductForm = z.infer<typeof productFormSchema>;
