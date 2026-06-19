import type { ChartConfigInput } from '$lib/types/configuration/styling';

export const DARK_THEME: ChartConfigInput = {
  font: 'ui-sans-serif, system-ui, sans-serif',
  color: '#e5e7eb',
  background: '#0f172a',
  border: 'color-mix(in srgb, #e5e7eb 18%, transparent)',
  title: { size: '1.6rem', weight: 600 },
  subtitle: { color: '#94a3b8' },
  caption: { color: '#94a3b8' },
  legend: { gap: '0.5rem 1.5rem', swatchSize: '1rem' },
  palette: ['#38bdf8', '#f472b6', '#a3e635', '#fbbf24', '#c084fc'],
  continuous: { min: '#1e293b', max: '#38bdf8', labelColor: '#e5e7eb' },
  axis: { color: '#94a3b8', fontSize: 13 },
  tooltip: { background: '#e5e7eb', color: '#0f172a' },
  line: { strokeWidth: 3, dotRadius: 4 },
  timeline: { activeColor: '#38bdf8', axisColor: '#94a3b8', thickness: 60 },
};
