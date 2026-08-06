import { Loader2 } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SalesPerDay } from '../model/analytics.types';

const CHART_LABEL_STYLE = { fontSize: 12, fill: '#64748b' };

interface RevenueChartProps {
  data: SalesPerDay[] | undefined;
  isLoading: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Revenue per day
      </h2>
      {isLoading ? (
        <div className="flex h-56 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={224}>
          <LineChart data={data}>
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
  );
}
