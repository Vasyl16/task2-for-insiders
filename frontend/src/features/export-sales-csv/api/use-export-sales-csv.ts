import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/shared/api';
import type { AnalyticsRangeParams } from '@/entities/analytics';

async function exportSalesCsv(params: AnalyticsRangeParams): Promise<void> {
  const response = await apiClient.get<Blob>('/analytics/export', {
    params,
    responseType: 'blob',
  });

  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sales-export.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useExportSalesCsv(): UseMutationResult<void, unknown, AnalyticsRangeParams> {
  return useMutation({ mutationFn: exportSalesCsv });
}
