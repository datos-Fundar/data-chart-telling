import type { CellSegmentStyle } from '$lib/types/plots/segments/common';
import type { ResolvedChannel, ResolvedChannels } from '$lib/types/layout/mapping';
import type { LegendRange } from '$lib/types/layout/legend';
import type { AxisPlotState, AxisPlotCtx } from '$lib/types/phases';

/**
 * The active continuous-legend range filter, if any - narrows which cells
 * render at full opacity, and in `'rescale'` mode, the color domain itself.
 */
export type HeatmapRangeFilter = LegendRange;

/**
 * HeatmapPlot's pipeline state: the shared axis-based state, where `color` is
 * each cell's value channel (so always resolved) rather than a grouping key.
 */
export type HeatmapPlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	CellSegmentStyle
> & {
	// "mapping" phase output.
	channels?: ResolvedChannels<TData> & { color: ResolvedChannel<TData, unknown> };

	/** "scales" phase output: each row's own resolved color, composed from `channels.color` and the color ramp. */
	resolveColor?: (row: TData) => string;
	/** "scales" phase output: each row's own resolved opacity, composed from `channels.opacity` and the opacity ramp - `undefined` when `opacity` itself is unset. */
	resolveOpacity?: (row: TData) => number;
};

/** The environment every HeatmapPlot phase reads from, alongside the growing state. */
export type HeatmapPlotCtx = AxisPlotCtx & {
	range: HeatmapRangeFilter | null | undefined;
};
