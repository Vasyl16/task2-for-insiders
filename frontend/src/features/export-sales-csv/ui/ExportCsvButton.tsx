import { Download, Loader2 } from 'lucide-react';
import type { AnalyticsRangeParams } from '@/entities/analytics';
import { useExportSalesCsv } from '../api/use-export-sales-csv';

interface ExportCsvButtonProps {
  range: AnalyticsRangeParams;
}

export function ExportCsvButton({ range }: ExportCsvButtonProps) {
  const { mutate, isPending } = useExportSalesCsv();

  return (
    <button
      type="button"
      onClick={() => mutate(range)}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Export CSV
    </button>
  );
}
