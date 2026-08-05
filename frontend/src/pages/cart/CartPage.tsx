import { AlertCircle, ArrowRight, Loader2, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '@/app/routes';
import { useCart } from '@/entities/cart';
import { CartItemRow } from '@/features/manage-cart-item';

export function CartPage() {
  const { data: cart, isLoading, isError, refetch } = useCart();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-slate-900">
        <ShoppingCart className="h-6 w-6" />
        Your Cart
      </h1>

      {isLoading && (
        <div className="flex items-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading cart…
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="text-sm text-red-700">Failed to load your cart.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-sm font-medium text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {cart && cart.items.length === 0 && (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-slate-300 py-16 text-center">
          <ShoppingBag className="mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm text-slate-500">Your cart is empty.</p>
          <Link
            to={paths.home}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-900 underline"
          >
            Browse products
          </Link>
        </div>
      )}

      {cart && cart.items.length > 0 && (
        <>
          <div className="rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
            {cart.items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
            <span className="text-sm text-slate-600">{cart.totalItems} item(s)</span>
            <span className="text-lg font-semibold text-slate-900">
              Subtotal: ${cart.subtotal.toFixed(2)}
            </span>
          </div>

          <Link
            to={paths.checkout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            Proceed to checkout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      )}
    </div>
  );
}
