import { Fragment, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Loader2, Receipt } from 'lucide-react';
import {
  OrderStatusBadge,
  OrderStatusHistoryTimeline,
  useAdminOrders,
  useOrderHistory,
  type OrderStatus,
} from '@/entities/order';
import { OrderStatusActions } from '@/features/manage-order-status';
import { Pagination, Select, type SelectOption } from '@/shared/ui';

const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { data, isLoading, isError, isPlaceholderData } = useAdminOrders({
    page,
    limit: 20,
    status: status || undefined,
  });
  const history = useOrderHistory(expandedOrderId ?? undefined, Boolean(expandedOrderId));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <Receipt className="h-6 w-6" />
          Orders
        </h1>
        <Select
          options={STATUS_FILTER_OPTIONS}
          value={status}
          onChange={(value) => {
            setStatus(value as OrderStatus | '');
            setPage(1);
          }}
          className="w-48"
          aria-label="Filter by status"
        />
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading orders…
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">Failed to load orders.</p>
        </div>
      )}

      {data && data.items.length === 0 && (
        <p className="py-16 text-center text-sm text-slate-500">No orders match this filter.</p>
      )}

      {data && data.items.length > 0 && (
        <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${isPlaceholderData ? 'opacity-60' : ''}`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <Fragment key={order.id}>
                    <tr className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{order.customerEmail ?? '—'}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusActions order={order} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          aria-label={isExpanded ? 'Hide details' : 'Show details'}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-slate-100 bg-slate-50/50 last:border-b-0">
                        <td colSpan={6} className="px-4 py-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-1 text-xs text-slate-600">
                              <span>
                                {item.productName} × {item.quantity}
                              </span>
                              <span>${item.lineTotal.toFixed(2)}</span>
                            </div>
                          ))}
                          {order.cancelReason && (
                            <p className="mt-2 text-xs text-red-600">Cancelled: {order.cancelReason}</p>
                          )}
                          <p className="mt-3 mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                            Status history
                          </p>
                          <OrderStatusHistoryTimeline history={history.data} isLoading={history.isLoading} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
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
