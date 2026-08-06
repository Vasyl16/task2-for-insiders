import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  LayoutDashboard,
  ListTree,
  Loader2,
  Package,
  Receipt,
  Truck,
  XCircle,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '@/app/routes';
import { useProducts } from '@/entities/product';
import { useCategories } from '@/entities/category';
import { useAdminOrders, type OrderStatus } from '@/entities/order';

interface StatCardProps {
  label: string;
  value: number | undefined;
  isLoading: boolean;
  Icon: LucideIcon;
}

function StatCard({ label, value, isLoading, Icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-5 w-5 text-slate-600" />
      </span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        {isLoading ? (
          <Loader2 className="mt-1 h-4 w-4 animate-spin text-slate-400" />
        ) : (
          <p className="text-xl font-semibold text-slate-900">{value ?? 0}</p>
        )}
      </div>
    </div>
  );
}

const ORDER_STATUS_STATS: { status: OrderStatus; label: string; Icon: LucideIcon }[] = [
  { status: 'NEW', label: 'New', Icon: Package },
  { status: 'PROCESSING', label: 'Processing', Icon: Zap },
  { status: 'SHIPPED', label: 'Shipped', Icon: Truck },
  { status: 'COMPLETED', label: 'Completed', Icon: CheckCircle2 },
  { status: 'CANCELLED', label: 'Cancelled', Icon: XCircle },
];

export function AdminDashboardPage() {
  const products = useProducts({ limit: 1 });
  const categories = useCategories();
  const newOrders = useAdminOrders({ limit: 1, status: 'NEW' });
  const processingOrders = useAdminOrders({ limit: 1, status: 'PROCESSING' });
  const shippedOrders = useAdminOrders({ limit: 1, status: 'SHIPPED' });
  const completedOrders = useAdminOrders({ limit: 1, status: 'COMPLETED' });
  const cancelledOrders = useAdminOrders({ limit: 1, status: 'CANCELLED' });

  const orderQueriesByStatus: Record<OrderStatus, ReturnType<typeof useAdminOrders>> = {
    NEW: newOrders,
    PROCESSING: processingOrders,
    SHIPPED: shippedOrders,
    COMPLETED: completedOrders,
    CANCELLED: cancelledOrders,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-slate-900">
        <LayoutDashboard className="h-6 w-6" />
        Dashboard
      </h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total products"
          value={products.data?.meta.total}
          isLoading={products.isLoading}
          Icon={Package}
        />
        <StatCard
          label="Total categories"
          value={categories.data?.length}
          isLoading={categories.isLoading}
          Icon={ListTree}
        />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Orders by status
      </h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {ORDER_STATUS_STATS.map(({ status, label, Icon }) => {
          const query = orderQueriesByStatus[status];
          return (
            <StatCard
              key={status}
              label={label}
              value={query.data?.meta.total}
              isLoading={query.isLoading}
              Icon={Icon}
            />
          );
        })}
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Manage
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to={paths.admin.products}
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50"
        >
          <Package className="h-5 w-5 text-slate-500" />
          <span className="text-sm font-medium text-slate-900">Products</span>
        </Link>
        <Link
          to={paths.admin.categories}
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50"
        >
          <ListTree className="h-5 w-5 text-slate-500" />
          <span className="text-sm font-medium text-slate-900">Categories</span>
        </Link>
        <Link
          to={paths.admin.orders}
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50"
        >
          <Receipt className="h-5 w-5 text-slate-500" />
          <span className="text-sm font-medium text-slate-900">Orders</span>
        </Link>
      </div>
    </div>
  );
}
