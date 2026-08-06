import { CheckCircle2, Package, Truck, XCircle, Zap } from 'lucide-react';
import type { OrderStatus } from '../model/order.types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string; Icon: typeof Package }> = {
  NEW: { label: 'New', className: 'bg-slate-100 text-slate-700', Icon: Package },
  PROCESSING: { label: 'Processing', className: 'bg-blue-100 text-blue-700', Icon: Zap },
  SHIPPED: { label: 'Shipped', className: 'bg-purple-100 text-purple-700', Icon: Truck },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700', Icon: XCircle },
};

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const { label, className: statusClassName, Icon } = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
