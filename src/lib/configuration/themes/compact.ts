import type { ChartConfigInput } from '$lib/types/configuration/styling';

export const COMPACT_THEME: ChartConfigInput = {
  title: { size: '1.1rem', weight: 600 },
  subtitle: { size: '0.85rem' },
  legend: { size: '0.75rem', swatchSize: '0.9rem', gap: '0.25rem 1rem' },
  axis: { fontSize: 11, tickSize: 3, tickPadding: 6 },
  margins: { top: 12, right: 12, bottom: 22, left: 30 },
  line: { strokeWidth: 2, dotRadius: 3 },
};
