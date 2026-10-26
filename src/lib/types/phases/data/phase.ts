import type { Series } from '$lib/types/plots/data/common';
import type { DiscreteAxesCount } from '$lib/types/phases/data/axes';

/* eslint-disable @typescript-eslint/no-explicit-any */
/** How a plot kind's own mark splits into visual segments. */
export type SegmentsStageOptions = {
	/** The color a segment's own style sets, if any, for the markers scoped to its series. */
	color?: (style: any) => string | undefined;
	/** Whether adjacent visual segments share their boundary row - a continuous mark (line, area) does. Defaults to `true`. */
	connect?: boolean;
	/** Whether each segment's rows form one visual segment wherever they fall - a mark that summarizes a category's rows (box, violin) does - instead of one per run of consecutive rows. Defaults to `false`. */
	gather?: boolean;
};

/**
 * What differs between plots in the shared "data" stage. Everything else -
 * which channels the author set, what each axis is, which way the plot runs,
 * whether `color` groups - the stage reads off the data itself.
 */
export type DataStageOptions<TState, TCtx> = {
	/** How many axes the kind lays out as categories: 0 (line), 1 (bar) or 2 (heatmap). Defaults to 0. */
	discreteAxes?: DiscreteAxesCount;
	/** How the kind's own mark splits into visual segments. */
	segments?: SegmentsStageOptions;
	/** Tags or reorders the series once built, before colors and legend filtering. */
	orderSeries?: (series: Series<any>[], state: TState) => Series<any>[];
	/** The order colors are assigned in. Defaults to the series' own order. */
	colorOrder?: (series: Series<any>[]) => Series<any>[];
	/** The plot's own extra "data" output, once the shared one is in place. */
	extend?: (state: TState, ctx: TCtx) => TState;
};
/* eslint-enable @typescript-eslint/no-explicit-any */
