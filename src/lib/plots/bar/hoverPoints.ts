import { SERIES_KEY } from '$lib/layout/phases/transforms';
import { GAP_VALUE } from '$lib/plots/bar/phases/transforms';
import type { ProcessedData, ProcessedRow } from '$lib/types/layout/phases';
import type { HoverPoint } from '$lib/types/layout/tooltip';
import type { BarLayout } from '$lib/types/plots/bar/layout';

/**
 * Builds hover-marker candidate points for every real (non-gap) row the
 * "transforms" phase left, across every series.
 *
 * `x`/`y` (the values matching is keyed off) are the row's category and the
 * top of its bar, so every series at the same category still matches together
 * under the 'x' strategy; `dx`/`dy` only nudge where the matched point is
 * *drawn* — see {@link import('$lib/types/layout/tooltip').HoverDisplayPoint} —
 * by a grouped bar's own pixel-only slice offset.
 */
export function buildHoverPoints<TData extends Record<string, unknown>>(args: {
	processed: ProcessedData;
	isHorizontal: boolean;
	geometry: Pick<
		BarLayout,
		'layout' | 'categoryOf' | 'spanOf' | 'seriesIndexOf' | 'groupOffset' | 'groupInsetFraction'
	>;
	label: (row: TData) => string;
	colorFor: (seriesName: string) => string;
}): HoverPoint<TData>[] {
	const { processed, isHorizontal, geometry, label, colorFor } = args;
	return processed.data.flatMap((row: ProcessedRow) => {
		const span = geometry.spanOf(row);
		if (!span || row[GAP_VALUE] !== undefined) return [];
		const series = String(row[SERIES_KEY]);
		const idx = geometry.seriesIndexOf(series);
		const category = geometry.categoryOf(row);
		const value = span[1];
		const { dx, dy } = geometry.groupOffset(idx);
		return {
			x: isHorizontal ? value : category,
			y: isHorizontal ? category : value,
			dx,
			dy,
			areaInset: geometry.layout === 'grouped' ? geometry.groupInsetFraction(idx) : undefined,
			row: row as TData,
			label: label(row as TData),
			series,
			color: colorFor(series)
		};
	});
}
