import { useState } from 'react';
import { CheckCircle2, Loader2, Truck, XCircle, Zap } from 'lucide-react';
import type { Order, OrderStatus } from '@/entities/order';
import { useUpdateOrderStatus } from '../api/use-update-order-status';
import { ORDER_STATUS_TRANSITIONS } from '../model/order-status-transitions';

interface OrderStatusActionsProps {
  order: Order;
}

const ACTION_CONFIG: Partial<Record<OrderStatus, { label: string; Icon: typeof Zap; className: string }>> = {
  PROCESSING: { label: 'Start processing', Icon: Zap, className: 'border-blue-300 text-blue-700 hover:bg-blue-50' },
  SHIPPED: { label: 'Mark shipped', Icon: Truck, className: 'border-purple-300 text-purple-700 hover:bg-purple-50' },
  COMPLETED: {
    label: 'Mark completed',
    Icon: CheckCircle2,
    className: 'border-green-300 text-green-700 hover:bg-green-50',
  },
};

export function OrderStatusActions({ order }: OrderStatusActionsProps) {
  const updateStatus = useUpdateOrderStatus();
  const [isCancelling, setIsCancelling] = useState(false);
  const [reason, setReason] = useState('');

  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status];

  if (nextStatuses.length === 0) {
    return <span className="text-xs text-slate-400">No further actions</span>;
  }

  if (isCancelling) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason (optional)"
          autoFocus
          className="w-36 rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
        <button
          type="button"
          disabled={updateStatus.isPending}
          onClick={() => {
            updateStatus.mutate({ orderId: order.id, status: 'CANCELLED', reason: reason || undefined });
            setIsCancelling(false);
            setReason('');
          }}
          className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={() => setIsCancelling(false)}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {nextStatuses.map((status) => {
        const isPendingThis = updateStatus.isPending && updateStatus.variables?.status === status;

        if (status === 'CANCELLED') {
          return (
            <button
              key={status}
              type="button"
              onClick={() => setIsCancelling(true)}
              disabled={updateStatus.isPending}
              className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="h-3 w-3" />
              Cancel
            </button>
          );
        }

        const config = ACTION_CONFIG[status];
        if (!config) return null;
        const { label, Icon, className } = config;

        return (
          <button
            key={status}
            type="button"
            onClick={() => updateStatus.mutate({ orderId: order.id, status })}
            disabled={updateStatus.isPending}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          >
            {isPendingThis ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
