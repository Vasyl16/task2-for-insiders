export type ProductSortField = 'createdAt' | 'price' | 'name';
export type SortOrder = 'asc' | 'desc';

/** Minimal category shape as nested in a Product response — see entities/category for the standalone entity. */
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  categoryId: string;
  category: ProductCategory;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse {
  items: Product[];
  meta: PaginationMeta;
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSortField;
  sortOrder?: SortOrder;
}
