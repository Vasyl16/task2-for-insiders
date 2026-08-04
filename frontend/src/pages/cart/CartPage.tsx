import { Link } from 'react-router-dom';
import { paths } from '@/app/routes';
import { useCart } from '@/entities/cart';
import { CartItemRow } from '@/features/manage-cart-item';

export function CartPage() {
  const { data: cart, isLoading, isError, refetch } = useCart();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Your Cart</h1>

      {isLoading && <p className="text-sm text-slate-500">Loading cart…</p>}

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">Failed to load your cart.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 text-sm font-medium text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {cart && cart.items.length === 0 && (
        <div className="rounded-md border border-slate-200 py-16 text-center">
          <p className="text-sm text-slate-500">Your cart is empty.</p>
          <Link to={paths.home} className="mt-4 inline-block text-sm font-medium text-slate-900 underline">
            Browse products
          </Link>
        </div>
      )}

      {cart && cart.items.length > 0 && (
        <>
          <div className="rounded-md border border-slate-200 px-4">
            {cart.items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
            <span className="text-sm text-slate-600">{cart.totalItems} item(s)</span>
            <span className="text-lg font-semibold text-slate-900">
              Subtotal: ${cart.subtotal.toFixed(2)}
            </span>
          </div>

          <Link
            to={paths.checkout}
            className="mt-6 block w-full rounded-md bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-700"
          >
            Proceed to checkout
          </Link>
        </>
      )}
    </div>
  );
}
