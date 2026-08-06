import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  DollarSign,
  LayoutDashboard,
  ListTree,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Truck,
  XCircle,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '@/app/routes';
import { useProducts } from '@/entities/product';
import { useCategories } from '@/entities/category';
import { useAdminOrders, type OrderStatus } from '@/entities/order';
import {
  RevenueChart,
  TopProductsChart,
  useAnalyticsOverview,
  useSalesPerDay,
  useTopProducts,
} from '@/entities/analytics';
import { ExportCsvButton } from '@/features/export-sales-csv';
import { Select, StatCard } from '@/shared/ui';

const ORDER_STATUS_STATS: { status: OrderStatus; label: string; Icon: LucideIcon }[] = [
  { status: 'NEW', label: 'New', Icon: Package },
  { status: 'PROCESSING', label: 'Processing', Icon: Zap },
  { status: 'SHIPPED', label: 'Shipped', Icon: Truck },
  { status: 'COMPLETED', label: 'Completed', Icon: CheckCircle2 },
  { status: 'CANCELLED', label: 'Cancelled', Icon: XCircle },
];

const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

export function AdminDashboardPage() {
  const [rangeDays, setRangeDays] = useState('30');

  const range = useMemo(() => {
    const to = new Date();
    const from = new Date(to.getTime() - Number(rangeDays) * 24 * 60 * 60 * 1000);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [rangeDays]);

  const overview = useAnalyticsOverview(range);
  const salesPerDay = useSalesPerDay(range);
  const topProducts = useTopProducts({ ...range, limit: 5 });
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
          <LayoutDashboard className="h-6 w-6" />
          Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <Select
            options={RANGE_OPTIONS}
            value={rangeDays}
            onChange={setRangeDays}
            aria-label="Date range"
            className="w-40"
          />
          <ExportCsvButton range={range} />
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Revenue"
          value={overview.isLoading ? undefined : `$${(overview.data?.revenue ?? 0).toFixed(2)}`}
          isLoading={overview.isLoading}
          Icon={DollarSign}
        />
        <StatCard
          label="Orders"
          value={overview.data?.ordersCount}
          isLoading={overview.isLoading}
          Icon={ShoppingCart}
        />
        <StatCard
          label="Avg. order value"
          value={
            overview.isLoading ? undefined : `$${(overview.data?.averageOrderValue ?? 0).toFixed(2)}`
          }
          isLoading={overview.isLoading}
          Icon={TrendingUp}
        />
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

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <RevenueChart data={salesPerDay.data} isLoading={salesPerDay.isLoading} />
        <TopProductsChart data={topProducts.data} isLoading={topProducts.isLoading} />
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
