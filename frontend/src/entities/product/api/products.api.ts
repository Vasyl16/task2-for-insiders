import { apiClient } from '@/shared/api';
import type { Product, ProductListResponse, ProductsQueryParams } from '../model/product.types';

export async function fetchProducts(params: ProductsQueryParams): Promise<ProductListResponse> {
  const { data } = await apiClient.get<ProductListResponse>('/products', { params });
  return data;
}

export async function fetchProductById(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}
