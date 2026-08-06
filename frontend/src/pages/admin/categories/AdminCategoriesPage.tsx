import { useState } from 'react';
import { AlertCircle, ListTree, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCategories, type Category } from '@/entities/category';
import { CategoryFormModal, useDeleteCategory } from '@/features/manage-categories';

export function AdminCategoriesPage() {
  const { data: categories, isLoading, isError } = useCategories();
  const deleteCategory = useDeleteCategory();
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const openCreateForm = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <ListTree className="h-6 w-6" />
          Categories
        </h1>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" />
          New category
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading categories…
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">Failed to load categories.</p>
        </div>
      )}

      {categories && categories.length === 0 && (
        <p className="py-16 text-center text-sm text-slate-500">No categories yet.</p>
      )}

      {categories && categories.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{category.name}</td>
                  <td className="px-4 py-3 text-slate-500">{category.slug}</td>
                  <td className="px-4 py-3">
                    {confirmingDeleteId === category.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-slate-500">Delete?</span>
                        <button
                          type="button"
                          disabled={deleteCategory.isPending}
                          onClick={() => {
                            deleteCategory.mutate(category.id, {
                              onSuccess: () => setConfirmingDeleteId(null),
                            });
                          }}
                          className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(null)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditForm(category)}
                          aria-label={`Edit ${category.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(category.id)}
                          aria-label={`Delete ${category.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CategoryFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} category={editingCategory} />
    </div>
  );
}
