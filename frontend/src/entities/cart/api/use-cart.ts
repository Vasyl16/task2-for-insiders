import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchCart } from './cart.api';
import { cartQueryKeys } from '../model/query-keys';
import type { Cart } from '../model/cart.types';

export function useCart(): UseQueryResult<Cart> {
  return useQuery({
    queryKey: cartQueryKeys.detail(),
    queryFn: fetchCart,
  });
}
