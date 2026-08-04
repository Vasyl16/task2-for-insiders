import { roundToCents } from '@/shared/utils';
import type { Cart, CartItem } from '../model/cart.types';

function computeTotals(items: CartItem[]): Pick<Cart, 'totalItems' | 'subtotal'> {
  return {
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: roundToCents(items.reduce((sum, item) => sum + item.lineTotal, 0)),
  };
}

export function withUpdatedItemQuantity(cart: Cart, itemId: string, quantity: number): Cart {
  const items = cart.items.map((item) =>
    item.id === itemId
      ? { ...item, quantity, lineTotal: roundToCents(item.product.price * quantity) }
      : item,
  );
  return { ...cart, items, ...computeTotals(items) };
}

export function withRemovedItem(cart: Cart, itemId: string): Cart {
  const items = cart.items.filter((item) => item.id !== itemId);
  return { ...cart, items, ...computeTotals(items) };
}
