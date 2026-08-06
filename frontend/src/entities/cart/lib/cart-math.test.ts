import { describe, expect, it } from 'vitest';
import type { Cart, CartItem } from '../model/cart.types';
import { withRemovedItem, withUpdatedItemQuantity } from './cart-math';

function buildItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 'item-1',
    productId: 'prod-1',
    quantity: 2,
    product: {
      id: 'prod-1',
      name: 'Widget',
      slug: 'widget',
      imageUrl: 'https://example.com/widget.png',
      price: 9.99,
      stock: 10,
    },
    lineTotal: 19.98,
    ...overrides,
  };
}

function buildCart(items: CartItem[]): Cart {
  return {
    id: 'cart-1',
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
}

describe('withUpdatedItemQuantity', () => {
  it('updates the quantity and line total of the matching item', () => {
    const cart = buildCart([buildItem()]);

    const result = withUpdatedItemQuantity(cart, 'item-1', 4);

    expect(result.items[0].quantity).toBe(4);
    expect(result.items[0].lineTotal).toBeCloseTo(39.96);
  });

  it('recomputes totalItems and subtotal across all items', () => {
    const cart = buildCart([
      buildItem({ id: 'item-1', quantity: 2, lineTotal: 19.98 }),
      buildItem({
        id: 'item-2',
        productId: 'prod-2',
        quantity: 1,
        lineTotal: 5,
        product: { ...buildItem().product, id: 'prod-2', price: 5 },
      }),
    ]);

    const result = withUpdatedItemQuantity(cart, 'item-1', 3);

    expect(result.totalItems).toBe(4);
    expect(result.subtotal).toBeCloseTo(34.97);
  });

  it('leaves other items untouched', () => {
    const other = buildItem({ id: 'item-2', productId: 'prod-2' });
    const cart = buildCart([buildItem(), other]);

    const result = withUpdatedItemQuantity(cart, 'item-1', 5);

    expect(result.items[1]).toEqual(other);
  });
});

describe('withRemovedItem', () => {
  it('removes the matching item and recomputes totals', () => {
    const cart = buildCart([
      buildItem({ id: 'item-1' }),
      buildItem({ id: 'item-2', productId: 'prod-2' }),
    ]);

    const result = withRemovedItem(cart, 'item-1');

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('item-2');
    expect(result.totalItems).toBe(2);
    expect(result.subtotal).toBeCloseTo(19.98);
  });

  it('returns an empty cart when removing the last item', () => {
    const cart = buildCart([buildItem()]);

    const result = withRemovedItem(cart, 'item-1');

    expect(result.items).toHaveLength(0);
    expect(result.totalItems).toBe(0);
    expect(result.subtotal).toBe(0);
  });
});
