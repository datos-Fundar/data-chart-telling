import type { AxisValue } from '$lib/types/layout/mapping';
import type { ProcessedRow } from '$lib/types/layout/phases';

/** How a BarPlot's series share a category: side by side, or stacked by a plot-level `stackY`. */
export type BarSeriesLayout = 'grouped' | 'stacked';

export type BarLayout = {
	layout: BarSeriesLayout;
	valueBaseline: number;
	estimatedBandwidth: number;
	seriesCount: number;
	seriesStep: number;
	seriesGap: number;
	/** A processed row's category. */
	categoryOf: (row: ProcessedRow) => AxisValue;
	/** A processed row's bar along the value axis: from its `y1` (or the baseline) to its top; `undefined` when the row has no value. */
	spanOf: (row: ProcessedRow) => [number, number] | undefined;
	/** A series' position among the plot's series, `-1` for an unknown one. */
	seriesIndexOf: (name: string) => number;
	groupOffset: (seriesIndex: number) => { dx: number; dy: number };
	groupInsetFraction: (seriesIndex: number) => { start: number; end: number };
};
