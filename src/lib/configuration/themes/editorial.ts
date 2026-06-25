import type { ChartConfigInput } from '$lib/types/configuration/styling';

export const EDITORIAL_THEME: ChartConfigInput = {
  font: 'Georgia, "Times New Roman", serif',
  color: '#2b2118',
  border: 'color-mix(in srgb, #2b2118 20%, transparent)',
  title: { size: '1.9rem', weight: 700, leading: '1.1', spacing: '-0.01em' },
  subtitle: { color: '#8a6d3b', size: '1.05rem' },
  caption: { color: '#8a6d3b' },
  palette: ['#9b2226', '#606c38', '#6a4c93', '#ee9b00', '#005f73'],
  continuous: { min: '#fff3e0', max: '#bb3e03', labelColor: '#2b2118' },
  axis: { color: '#8a6d3b', fontSize: 13, xTickSize: 6, yTickSize: 6 },
  line: { strokeWidth: 5, dotRadius: 5 },
  timeline: { activeColor: '#bb3e03', axisColor: '#8a6d3b', thickness: 60 },
  hover: { rule: { stroke: '#bb3e03' } },
};
