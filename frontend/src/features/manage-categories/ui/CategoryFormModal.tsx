import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type { Category } from '@/entities/category';
import { FormError, Input, Label, Modal } from '@/shared/ui';
import { categoryFormSchema, type CategoryForm } from '../model/schemas';
import { useCreateCategory } from '../api/use-create-category';
import { useUpdateCategory } from '../api/use-update-category';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
}

export function CategoryFormModal({ isOpen, onClose, category }: CategoryFormModalProps) {
  const isEditing = Boolean(category);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryForm>({ resolver: zodResolver(categoryFormSchema), defaultValues: { name: '' } });

  const isSaving = createCategory.isPending || updateCategory.isPending;

  useEffect(() => {
    if (isOpen) {
      reset({ name: category?.name ?? '' });
    }
  }, [isOpen, category, reset]);

  const onSubmit = handleSubmit((values) => {
    const onSuccess = () => {
      reset({ name: '' });
      onClose();
    };
    if (category) {
      updateCategory.mutate({ categoryId: category.id, values }, { onSuccess });
    } else {
      createCategory.mutate(values, { onSuccess });
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit category' : 'New category'}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="category-name">Name</Label>
          <Input id="category-name" autoFocus {...register('name')} />
          <FormError message={errors.name?.message} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? 'Save changes' : 'Create category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
