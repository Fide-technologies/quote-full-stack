import type { QuoteFilters } from './index';

export async function exportQuotesCSV(filters: QuoteFilters = {}): Promise<void> {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.status) params.append('status', filters.status);
  if (filters.date) params.append('date', filters.date);
  if (filters.hasDraftOrder !== undefined)
    params.append('hasDraftOrder', filters.hasDraftOrder.toString());

  const res = await fetch(`/api/quotes/export?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to export quotes');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes_export.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
