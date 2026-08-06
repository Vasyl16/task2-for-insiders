import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, Loader2 } from 'lucide-react';
import { useCategories } from '@/entities/category';
import type { Product } from '@/entities/product';
import { FormError, Input, Label, Modal, Select, Textarea } from '@/shared/ui';
import { productFormSchema, type ProductForm } from '../model/schemas';
import { useCreateProduct } from '../api/use-create-product';
import { useUpdateProduct } from '../api/use-update-product';
import { useUploadProductImage } from '../api/use-upload-product-image';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}

const EMPTY_DEFAULTS: ProductForm = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  categoryId: '',
  imageUrl: '',
};

export function ProductFormModal({ isOpen, onClose, product }: ProductFormModalProps) {
  const isEditing = Boolean(product);
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const uploadImage = useUploadProductImage();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productFormSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  const imageUrl = watch('imageUrl');
  const isSaving = createProduct.isPending || updateProduct.isPending;

  useEffect(() => {
    if (isOpen) {
      reset(
        product
          ? {
              name: product.name,
              description: product.description,
              price: product.price,
              stock: product.stock,
              categoryId: product.categoryId,
              imageUrl: product.imageUrl,
            }
          : EMPTY_DEFAULTS,
      );
    }
  }, [isOpen, product, reset]);

  const onSubmit = handleSubmit((values) => {
    const onSuccess = () => {
      reset(EMPTY_DEFAULTS);
      onClose();
    };
    if (product) {
      updateProduct.mutate({ productId: product.id, values }, { onSuccess });
    } else {
      createProduct.mutate(values, { onSuccess });
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit product' : 'New product'}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="product-name">Name</Label>
          <Input id="product-name" {...register('name')} />
          <FormError message={errors.name?.message} />
        </div>

        <div>
          <Label htmlFor="product-description">Description</Label>
          <Textarea id="product-description" rows={4} {...register('description')} />
          <FormError message={errors.description?.message} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="product-price">Price</Label>
            <Input id="product-price" type="number" step="0.01" min="0" {...register('price')} />
            <FormError message={errors.price?.message} />
          </div>
          <div>
            <Label htmlFor="product-stock">Stock</Label>
            <Input id="product-stock" type="number" step="1" min="0" {...register('stock')} />
            <FormError message={errors.stock?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="product-category">Category</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select
                aria-label="Category"
                value={field.value}
                onChange={field.onChange}
                placeholder="Select a category…"
                options={(categories ?? []).map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
              />
            )}
          />
          <FormError message={errors.categoryId?.message} />
        </div>

        <div>
          <Label htmlFor="product-image">Image</Label>
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200">
              {imageUrl && <img src={imageUrl} alt="" className="h-full w-full object-cover" />}
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              {uploadImage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              Upload image
              <input
                id="product-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  uploadImage.mutate(file, {
                    onSuccess: (url) => setValue('imageUrl', url, { shouldDirty: true, shouldValidate: true }),
                  });
                }}
              />
            </label>
          </div>
          <FormError message={errors.imageUrl?.message} />
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
            {isEditing ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
