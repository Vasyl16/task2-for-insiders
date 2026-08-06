import { useState } from 'react';
import { AlertCircle, Loader2, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { useProducts, type Product, type ProductStatusFilter } from '@/entities/product';
import { CategoryFilter, SearchInput } from '@/features/catalog-search';
import { ProductFormModal, useDeleteProduct } from '@/features/manage-products';
import { Pagination } from '@/shared/ui';

export function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>('active');
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, isPlaceholderData } = useProducts({
    page,
    limit: 20,
    search: search || undefined,
    categoryId,
    status: statusFilter,
  });
  const deleteProduct = useDeleteProduct();

  const openCreateForm = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Package className="h-6 w-6" />
          Products
        </h1>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" />
          New product
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-[1.5fr,1fr,auto]">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
        <CategoryFilter
          value={categoryId}
          onChange={(value) => {
            setCategoryId(value);
            setPage(1);
          }}
        />
        <div className="flex items-center rounded-full border border-slate-200 bg-white p-1">
          {(['active', 'archived', 'all'] as ProductStatusFilter[]).map((option) => {
            const isActive = statusFilter === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setStatusFilter(option);
                  setPage(1);
                }}
                className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading products…
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">Failed to load products.</p>
        </div>
      )}

      {data && data.items.length === 0 && (
        <p className="py-16 text-center text-sm text-slate-500">No products match this filter.</p>
      )}

      {data && data.items.length > 0 && (
        <div
          className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${isPlaceholderData ? 'opacity-60' : ''}`}
        >
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((product) => (
                <tr key={product.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="h-10 w-10 flex-shrink-0 rounded-md object-cover ring-1 ring-slate-200"
                      />
                      <span className="font-medium text-slate-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{product.category.name}</td>
                  <td className="px-4 py-3 text-slate-700">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.stock === 0 ? 'font-medium text-red-600' : 'text-slate-700'
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {confirmingDeleteId === product.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-slate-500">Delete?</span>
                        <button
                          type="button"
                          disabled={deleteProduct.isPending}
                          onClick={() => {
                            deleteProduct.mutate(product.id, {
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
                          onClick={() => openEditForm(product)}
                          aria-label={`Edit ${product.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(product.id)}
                          aria-label={`Delete ${product.name}`}
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

      {data && (
        <div className="mt-8">
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        product={editingProduct}
      />
    </div>
  );
}
