import type { AxisPlotState, AxisPlotCtx, ProcessedRow } from '$lib/types/phases';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';

/** ClevelandPlot's pipeline state (shared by its wrappers): the shared axis-based state, with no extras of its own. */
export type ClevelandPlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	LineSegmentStyle
>;

/** The environment every ClevelandPlot phase reads from, alongside the growing state. */
export type ClevelandPlotCtx = AxisPlotCtx;

/** The configuration blocks the Cleveland-style plots draw their defaults from: one per plot. */
export type ClevelandConfigKey = 'lollipop' | 'dumbbell' | 'cleveland';

/** One category's dots along the value axis: the row each one draws, and the range they span. */
export type ClevelandEntry = {
	category: unknown;
	dots: { row: ProcessedRow; value: number; series: string }[];
	/** The smallest value of the category - or the baseline, when that is lower and counts as an end. */
	from: number;
	/** The largest value of the category - or the baseline, when that is higher and counts as an end. */
	to: number;
};

/** Where a dot sits in its category's range: at the top end, at the bottom end, or between them. */
export type ClevelandRole = 'max' | 'min' | 'between';

/** What a wrapper plot checks about the layout of its series before drawing. */
export type ClevelandLayout = {
	/** How many series the plot draws. */
	seriesCount: number;
	/** The most series any one category has a value in. */
	maxSeriesPerCategory: number;
};

/** How a plot of the Cleveland family is set apart from its siblings. */
export type ClevelandOptions = {
	/** Name the plot's warnings go under, such as `'DumbbellPlot'`. */
	name: string;
	/** The configuration block the plot reads its dot radius, stem width, padding and label gap from. */
	config: ClevelandConfigKey;
	/** Whether the baseline counts as one end of every range, so a lone value is a stem rising from it (`true`), or the range is only what the values span. */
	fromBaseline?: boolean;
	/** What is wrong with the series layout, if anything: the plot warns once and draws anyway. */
	validate?: (layout: ClevelandLayout) => string | undefined;
};
