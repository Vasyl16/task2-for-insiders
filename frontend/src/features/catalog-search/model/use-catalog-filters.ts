import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ProductsQueryParams, ProductSortField, SortOrder } from '@/entities/product';

const DEFAULT_LIMIT = 8;
const SORTABLE_FIELDS: ProductSortField[] = ['createdAt', 'price', 'name'];

export interface CatalogFilters {
  search: string;
  categoryId: string | undefined;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  sortBy: ProductSortField;
  sortOrder: SortOrder;
  page: number;
}

export interface UseCatalogFiltersResult {
  filters: CatalogFilters;
  queryParams: ProductsQueryParams;
  setSearch: (value: string) => void;
  setCategoryId: (value: string | undefined) => void;
  setPriceRange: (minPrice: number | undefined, maxPrice: number | undefined) => void;
  setSort: (sortBy: ProductSortField, sortOrder: SortOrder) => void;
  setPage: (page: number) => void;
}

function parsePrice(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

/** Catalog filter state lives in the URL (search params) so it survives navigation and reloads. */
export function useCatalogFilters(): UseCatalogFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<CatalogFilters>(() => {
    const sortByParam = searchParams.get('sortBy');
    const page = Number.parseInt(searchParams.get('page') ?? '1', 10);

    return {
      search: searchParams.get('search') ?? '',
      categoryId: searchParams.get('categoryId') ?? undefined,
      minPrice: parsePrice(searchParams.get('minPrice')),
      maxPrice: parsePrice(searchParams.get('maxPrice')),
      sortBy: SORTABLE_FIELDS.includes(sortByParam as ProductSortField)
        ? (sortByParam as ProductSortField)
        : 'createdAt',
      sortOrder: searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc',
      page: Number.isFinite(page) && page > 0 ? page : 1,
    };
  }, [searchParams]);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>, resetPage: boolean) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        for (const [key, value] of Object.entries(updates)) {
          if (value) {
            next.set(key, value);
          } else {
            next.delete(key);
          }
        }
        if (resetPage) {
          next.delete('page');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const setSearch = useCallback(
    (value: string) => updateParams({ search: value || undefined }, true),
    [updateParams],
  );

  const setCategoryId = useCallback(
    (value: string | undefined) => updateParams({ categoryId: value }, true),
    [updateParams],
  );

  const setPriceRange = useCallback(
    (minPrice: number | undefined, maxPrice: number | undefined) =>
      updateParams(
        {
          minPrice: minPrice !== undefined ? String(minPrice) : undefined,
          maxPrice: maxPrice !== undefined ? String(maxPrice) : undefined,
        },
        true,
      ),
    [updateParams],
  );

  const setSort = useCallback(
    (sortBy: ProductSortField, sortOrder: SortOrder) =>
      updateParams(
        {
          sortBy: sortBy === 'createdAt' ? undefined : sortBy,
          sortOrder: sortOrder === 'desc' ? undefined : sortOrder,
        },
        true,
      ),
    [updateParams],
  );

  const setPage = useCallback(
    (page: number) => updateParams({ page: page > 1 ? String(page) : undefined }, false),
    [updateParams],
  );

  const queryParams = useMemo<ProductsQueryParams>(
    () => ({
      page: filters.page,
      limit: DEFAULT_LIMIT,
      categoryId: filters.categoryId,
      search: filters.search || undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [filters],
  );

  return { filters, queryParams, setSearch, setCategoryId, setPriceRange, setSort, setPage };
}
