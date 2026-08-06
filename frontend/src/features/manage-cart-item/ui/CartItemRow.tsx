import { Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '@/entities/cart';
import { getErrorMessage } from '@/shared/utils';
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
    <div
      className={`flex items-center gap-4 border-b border-slate-100 py-4 transition-opacity last:border-b-0 ${isRemoving ? 'opacity-40' : ''}`}
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
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
          <p className="mt-1 text-xs text-red-600">
            {getErrorMessage(updateCartItem.error, "Couldn't update quantity. Try again.")}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 rounded-full border border-slate-200 p-1">
        <button
          type="button"
          onClick={() => changeQuantity(item.quantity - 1)}
          disabled={isUpdating || item.quantity <= 1}
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Decrease quantity of ${item.product.name}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-medium tabular-nums text-slate-900">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => changeQuantity(item.quantity + 1)}
          disabled={isUpdating || atStockLimit}
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Increase quantity of ${item.product.name}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="w-20 text-right text-sm font-semibold text-slate-900">${item.lineTotal.toFixed(2)}</p>

      <button
        type="button"
        onClick={() => removeCartItem.mutate({ itemId: item.id })}
        disabled={isRemoving}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Remove ${item.product.name} from cart`}
      >
        {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
