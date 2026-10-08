import type { PlotStylesConfigInput } from '$lib/types/configuration/styling';

export const COMPACT_THEME: PlotStylesConfigInput = {
	title: { size: '1.1rem', weight: 600 },
	subtitle: { size: '0.85rem' },
	legend: { size: '0.75rem', swatchSize: '0.9rem', gap: '0.25rem 1rem' },
	axis: { fontSize: 11, xTickSize: 3, yTickSize: 3, xTickPadding: 6, yTickPadding: 6 },
	margins: { top: 18, right: 30, bottom: 22, left: 30 },
	line: { strokeWidth: 2, dotRadius: 3 },
	hover: { rule: { strokeWidth: 1, strokeDasharray: '3 3' }, dot: { dotRadius: 3 } }
};
