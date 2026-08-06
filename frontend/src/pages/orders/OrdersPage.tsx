import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Loader2, Package, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '@/app/routes';
import {
  OrderStatusBadge,
  OrderStatusHistoryTimeline,
  useMyOrders,
  useOrderHistory,
} from '@/entities/order';
import { Pagination } from '@/shared/ui';

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const { data, isLoading, isError, isPlaceholderData } = useMyOrders({ page, limit: 10 });
  const history = useOrderHistory(expandedOrderId ?? undefined, Boolean(expandedOrderId));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-slate-900">
        <Receipt className="h-6 w-6" />
        My Orders
      </h1>

      {isLoading && (
        <div className="flex items-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading orders…
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">Failed to load your orders.</p>
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-slate-300 py-16 text-center">
          <Package className="mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm text-slate-500">You haven&apos;t placed any orders yet.</p>
          <Link to={paths.home} className="mt-4 inline-block text-sm font-medium text-slate-900 underline">
            Browse products
          </Link>
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className={`space-y-4 ${isPlaceholderData ? 'opacity-60' : ''}`}>
          {data.items.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div key={order.id} className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-4 px-4 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      aria-label={isExpanded ? 'Hide details' : 'Show details'}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 pb-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border-b border-slate-50 py-2 text-sm last:border-b-0"
                      >
                        <span className="text-slate-700">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="font-medium text-slate-900">${item.lineTotal.toFixed(2)}</span>
                      </div>
                    ))}

                    <p className="mt-3 mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Status history
                    </p>
                    <OrderStatusHistoryTimeline
                      history={history.data}
                      isLoading={history.isLoading}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {data && (
        <div className="mt-8">
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
