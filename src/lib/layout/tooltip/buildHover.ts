import { processedPosition, SERIES_KEY } from '$lib/layout/phases/transforms';
import { hasHoverMarker, resolveHoverStrategy, resolveHoverSync } from '$lib/layout/tooltip/utils';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { HoverPoint, HoverStrategy } from '$lib/types/layout/tooltip';
import type { HoverConfig, PointMatchingStrategy, TooltipConfig } from '$lib/types/plots/props';
import type { LegendInteractionStore } from '$lib/types/layout/legend';
import type { ProcessedData, ProcessedRow } from '$lib/types/layout/phases';

/**
 * A plot's `hover` config for `BasePlotLayout`: active whenever there's a
 * tooltip or a hover marker, with the strategy and sync those two resolve to
 * (the plot kind's own `defaultStrategy` when neither sets one).
 */
export function buildHover<TRow extends Record<string, unknown>>(args: {
	tooltip: TooltipConfig<TRow> | undefined;
	markers: { type: string }[];
	points: HoverPoint<TRow>[];
	label: (row: TRow) => string;
	defaultStrategy: HoverStrategy;
	pointMatching?: PointMatchingStrategy;
}): HoverConfig<TRow> {
	const { tooltip, markers, points, label, defaultStrategy, pointMatching } = args;
	return {
		active: tooltip != null || hasHoverMarker(markers),
		points,
		label,
		strategy: resolveHoverStrategy(tooltip?.strategy, markers, defaultStrategy),
		sync: resolveHoverSync(tooltip?.sync, markers),
		tooltip,
		...(pointMatching ? { pointMatching } : {})
	};
}

/**
 * Hover candidates for a plot's own processed rows: each visible row at its
 * position (a stacked row's top, a bin's centre), in its series' color. A
 * series the legend turned off is left out, as is any row `include` rejects.
 */
export function buildProcessedHoverPoints<TRow extends Record<string, unknown>>(args: {
	processed: ProcessedData;
	colorFor: (seriesName: string) => string;
	legendInteraction: LegendInteractionStore | null | undefined;
	label: (row: TRow) => string;
	include?: (row: TRow) => boolean;
	/** The row a hovered point reads as, e.g. with derived fields added. Defaults to the processed row. */
	row?: (row: TRow) => TRow;
}): HoverPoint<TRow>[] {
	const { processed, colorFor, legendInteraction, label, include, row: rowOf } = args;
	const position = processedPosition(processed);
	return processed.data
		.filter((d: ProcessedRow) => !legendInteraction?.disabledSeries.has(d[SERIES_KEY] as string))
		.filter((d) => !include || include(d as TRow))
		.map((d) => {
			const row = d as TRow;
			const seriesName = d[SERIES_KEY] as string;
			return {
				x: position.x(d) as AxisValue,
				y: Number(position.y(d)),
				row: rowOf ? rowOf(row) : row,
				label: label(row),
				series: seriesName,
				color: colorFor(seriesName)
			};
		});
}
