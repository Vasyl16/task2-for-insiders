import type { CartItem } from '@/entities/cart';
import { useUpdateCartItem } from '../api/use-update-cart-item';
import { useRemoveCartItem } from '../api/use-remove-cart-item';

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  const isUpdating = updateCartItem.isPending;
  const isRemoving = removeCartItem.isPending;
  const atStockLimit = item.quantity >= item.product.stock;

  const changeQuantity = (nextQuantity: number) => {
    if (nextQuantity < 1 || nextQuantity > item.product.stock) {
      return;
    }
    updateCartItem.mutate({ itemId: item.id, quantity: nextQuantity });
  };

  return (
    <div className="flex items-center gap-4 border-b border-slate-200 py-4 last:border-b-0">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
        <img
          src={item.product.imageUrl}
          alt={item.product.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-900">{item.product.name}</h3>
        <p className="mt-1 text-sm text-slate-500">${item.product.price.toFixed(2)} each</p>
        {updateCartItem.isError && (
          <p className="mt-1 text-xs text-red-600">Couldn&apos;t update quantity. Try again.</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => changeQuantity(item.quantity - 1)}
          disabled={isUpdating || item.quantity <= 1}
          className="h-8 w-8 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Decrease quantity of ${item.product.name}`}
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-medium text-slate-900">{item.quantity}</span>
        <button
          type="button"
          onClick={() => changeQuantity(item.quantity + 1)}
          disabled={isUpdating || atStockLimit}
          className="h-8 w-8 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Increase quantity of ${item.product.name}`}
        >
          +
        </button>
      </div>

      <p className="w-20 text-right text-sm font-semibold text-slate-900">${item.lineTotal.toFixed(2)}</p>

      <button
        type="button"
        onClick={() => removeCartItem.mutate({ itemId: item.id })}
        disabled={isRemoving}
        className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}
