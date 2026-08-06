import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number | undefined;
  isLoading: boolean;
  Icon: LucideIcon;
}

export function StatCard({ label, value, isLoading, Icon }: StatCardProps) {
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
