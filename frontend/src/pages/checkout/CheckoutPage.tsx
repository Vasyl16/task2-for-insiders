import { useState } from 'react';
import { Link } from 'react-router-dom';
import { paths } from '@/app/routes';
import { useCart } from '@/entities/cart';
import type { Order } from '@/entities/order';
import { useCheckout } from '@/features/checkout';
import { Button } from '@/shared/ui';
import { getErrorMessage } from '@/shared/utils';

export function CheckoutPage() {
  const { data: cart, isLoading, isError } = useCart();
  const checkout = useCheckout();
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (completedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Order confirmed</h1>
        <p className="mb-6 text-sm text-slate-500">Order #{completedOrder.id}</p>

        <div className="rounded-md border border-slate-200 px-4">
          {completedOrder.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 border-b border-slate-200 py-4 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                <p className="text-sm text-slate-500">
                  Qty {item.quantity} × ${item.unitPrice.toFixed(2)}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-900">${item.lineTotal.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
          <span className="text-sm font-medium text-green-700">Status: {completedOrder.status}</span>
          <span className="text-lg font-semibold text-slate-900">
            Total: ${completedOrder.totalAmount.toFixed(2)}
          </span>
        </div>

        <Link to={paths.home} className="mt-6 inline-block text-sm font-medium text-slate-900 underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <p className="mx-auto max-w-2xl px-4 py-8 text-sm text-slate-500">Loading checkout…</p>;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-red-600">Failed to load your cart.</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-slate-500">Your cart is empty — add something before checking out.</p>
        <Link to={paths.home} className="mt-4 inline-block text-sm font-medium text-slate-900 underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Checkout</h1>

      <div className="rounded-md border border-slate-200 px-4">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 border-b border-slate-200 py-4 last:border-b-0"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{item.product.name}</p>
              <p className="text-sm text-slate-500">
                Qty {item.quantity} × ${item.product.price.toFixed(2)}
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-900">${item.lineTotal.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
        <span className="text-sm text-slate-600">{cart.totalItems} item(s)</span>
        <span className="text-lg font-semibold text-slate-900">Total: ${cart.subtotal.toFixed(2)}</span>
      </div>

      {checkout.isError && (
        <p className="mt-4 text-sm text-red-600">
          {getErrorMessage(checkout.error, 'Checkout failed. Please try again.')}
        </p>
      )}

      <Button
        type="button"
        className="mt-6"
        isLoading={checkout.isPending}
        onClick={() => checkout.mutate(undefined, { onSuccess: setCompletedOrder })}
      >
        Place order (mock payment)
      </Button>
    </div>
  );
}
