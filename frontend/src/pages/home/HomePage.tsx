import { Link } from 'react-router-dom';
import { buildProductPath } from '@/app/routes';
import { ProductCard, useProducts } from '@/entities/product';
import { AddToCartButton } from '@/features/add-to-cart';
import { CategoryFilter, SearchInput, SortSelect, useCatalogFilters } from '@/features/catalog-search';
import { Pagination } from '@/shared/ui';

export function HomePage() {
  const { filters, queryParams, setSearch, setCategoryId, setSort, setPage } = useCatalogFilters();
  const { data, isLoading, isError, isPlaceholderData } = useProducts(queryParams);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Products</h1>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <SearchInput value={filters.search} onChange={setSearch} />
        <CategoryFilter value={filters.categoryId} onChange={setCategoryId} />
        <SortSelect sortBy={filters.sortBy} sortOrder={filters.sortOrder} onChange={setSort} />
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading products…</p>}
      {isError && <p className="text-sm text-red-600">Failed to load products.</p>}
      {data && data.items.length === 0 && (
        <p className="text-sm text-slate-500">No products match your filters.</p>
      )}

      {data && data.items.length > 0 && (
        <div
          className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${isPlaceholderData ? 'opacity-60' : ''}`}
        >
          {data.items.map((product) => (
            <div key={product.id} className="flex flex-col gap-2">
              <Link to={buildProductPath(product.id)}>
                <ProductCard product={product} />
              </Link>
              <AddToCartButton productId={product.id} disabled={product.stock === 0} />
            </div>
          ))}
        </div>
      )}

      {data && (
        <div className="mt-8">
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
