import { apiClient } from '@/shared/api';
import type { Cart } from '../model/cart.types';

export async function fetchCart(): Promise<Cart> {
  const { data } = await apiClient.get<Cart>('/cart');
  return data;
}
