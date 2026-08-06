import { Loader2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TopProduct } from '../model/analytics.types';

const CHART_LABEL_STYLE = { fontSize: 12, fill: '#64748b' };

interface TopProductsChartProps {
  data: TopProduct[] | undefined;
  isLoading: boolean;
}

export function TopProductsChart({ data, isLoading }: TopProductsChartProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Top products by revenue
      </h2>
      {isLoading ? (
        <div className="flex h-56 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={224}>
          <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
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
  );
}
