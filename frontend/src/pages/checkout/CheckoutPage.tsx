import { useState } from 'react';
import { AlertCircle, CheckCircle2, CreditCard, Loader2, Mail, Package, ShoppingBag, XCircle } from 'lucide-react';
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
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </span>
          <h1 className="text-2xl font-semibold text-slate-900">Order confirmed</h1>
          <p className="mt-1 text-sm text-slate-500">Order #{completedOrder.id.slice(0, 8)}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
          {completedOrder.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-b-0"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Package className="h-5 w-5 text-slate-500" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{item.productName}</p>
                <p className="text-sm text-slate-500">
                  Qty {item.quantity} × ${item.unitPrice.toFixed(2)}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-900">${item.lineTotal.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Payment successful
          </span>
          <span className="text-lg font-semibold text-slate-900">
            Total: ${completedOrder.totalAmount.toFixed(2)}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
          <Mail className="h-4 w-4 flex-shrink-0" />
          A receipt email is on its way to your inbox.
        </div>

        <Link
          to={paths.home}
          className="mt-6 flex w-full items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-16 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading checkout…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">Failed to load your cart.</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex flex-col items-center rounded-lg border border-dashed border-slate-300 py-16 text-center">
          <ShoppingBag className="mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm text-slate-500">Your cart is empty — add something before checking out.</p>
          <Link
            to={paths.home}
            className="mt-4 inline-block text-sm font-medium text-slate-900 underline"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-slate-900">
        <CreditCard className="h-6 w-6" />
        Checkout
      </h1>

      <div className="rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-b-0"
          >
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{item.product.name}</p>
              <p className="text-sm text-slate-500">
                Qty {item.quantity} × ${item.product.price.toFixed(2)}
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-900">${item.lineTotal.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
        <span className="text-sm text-slate-600">{cart.totalItems} item(s)</span>
        <span className="text-lg font-semibold text-slate-900">Total: ${cart.subtotal.toFixed(2)}</span>
      </div>

      {checkout.isError && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm font-medium text-red-700">
            {getErrorMessage(checkout.error, 'Checkout failed. Please try again.')}
          </p>
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
        <CreditCard className="h-4 w-4 flex-shrink-0" />
        This is a mock payment gateway for demo purposes — no real card is charged, and charges
        are randomly declined to simulate real-world failures.
      </div>

      <Button
        type="button"
        className="mt-4 rounded-full py-3"
        isLoading={checkout.isPending}
        onClick={() => checkout.mutate(undefined, { onSuccess: setCompletedOrder })}
      >
        Place order (mock payment)
      </Button>
    </div>
  );
}
