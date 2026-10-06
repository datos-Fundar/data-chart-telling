import type { AxisValue } from '$lib/types/layout/mapping';

/** How a BarPlot's series share a category: side by side, or stacked by a plot-level `stackY`. */
export type BarSeriesLayout = 'grouped' | 'stacked';

export type BarLayout = {
	layout: BarSeriesLayout;
	valueBaseline: number;
	estimatedBandwidth: number;
	seriesCount: number;
	seriesStep: number;
	seriesGap: number;
	/** A stacked bar's own `[bottom, top]` at one category, as the stack placed it; `undefined` when not stacked or the row has no value. */
	stackedSpan: (category: AxisValue, seriesIndex: number) => [number, number] | undefined;
	groupOffset: (seriesIndex: number) => { dx: number; dy: number };
	groupInsetFraction: (seriesIndex: number) => { start: number; end: number };
};
