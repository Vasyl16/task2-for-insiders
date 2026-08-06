import { Loader2 } from 'lucide-react';
import type { OrderStatusHistoryEntry } from '../model/order.types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderStatusHistoryTimelineProps {
  history: OrderStatusHistoryEntry[] | undefined;
  isLoading: boolean;
}

export function OrderStatusHistoryTimeline({ history, isLoading }: OrderStatusHistoryTimelineProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading history…
      </div>
    );
  }

  if (!history || history.length === 0) {
    return <p className="py-3 text-xs text-slate-500">No history yet.</p>;
  }

  return (
    <ol className="space-y-3 py-3">
      {history.map((entry) => (
        <li key={entry.id} className="flex items-start gap-3 text-xs">
          <OrderStatusBadge status={entry.status} />
          <div className="min-w-0 flex-1">
            <p className="text-slate-500">
              {new Date(entry.createdAt).toLocaleString()}
              {entry.changedBy && entry.changedBy !== 'system' && <> · by {entry.changedBy}</>}
            </p>
            {entry.reason && <p className="mt-0.5 text-slate-600">{entry.reason}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
