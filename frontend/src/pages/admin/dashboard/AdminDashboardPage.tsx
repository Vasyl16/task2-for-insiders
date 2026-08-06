import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  DollarSign,
  LayoutDashboard,
  ListTree,
  Loader2,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Truck,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link } from 'react-router-dom';
import { paths } from '@/app/routes';
import { useProducts } from '@/entities/product';
import { useCategories } from '@/entities/category';
import { useAdminOrders, type OrderStatus } from '@/entities/order';
import { useAnalyticsOverview, useSalesPerDay, useTopProducts } from '@/entities/analytics';
import { ExportCsvButton } from '@/features/export-sales-csv';
import { Select } from '@/shared/ui';

interface StatCardProps {
  label: string;
  value: string | number | undefined;
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

const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

const CHART_LABEL_STYLE = { fontSize: 12, fill: '#64748b' };

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
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Revenue per day
          </h2>
          {salesPerDay.isLoading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : salesPerDay.data && salesPerDay.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={224}>
              <LineChart data={salesPerDay.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={CHART_LABEL_STYLE} tickMargin={8} />
                <YAxis tick={CHART_LABEL_STYLE} width={48} />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-56 items-center justify-center text-sm text-slate-500">
              No sales in this range.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Top products by revenue
          </h2>
          {topProducts.isLoading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : topProducts.data && topProducts.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={224}>
              <BarChart data={topProducts.data} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={CHART_LABEL_STYLE} />
                <YAxis
                  dataKey="productName"
                  type="category"
                  width={120}
                  tick={CHART_LABEL_STYLE}
                  tickFormatter={(name: string) => (name.length > 16 ? `${name.slice(0, 16)}…` : name)}
                />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Bar dataKey="revenue" fill="#0f172a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-56 items-center justify-center text-sm text-slate-500">
              No sales in this range.
            </p>
          )}
        </div>
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
