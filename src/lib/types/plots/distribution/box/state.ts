import type { AreaStyle } from '$lib/types/plots/styling';
import type { AxisPlotState, AxisPlotCtx, ProcessedRow } from '$lib/types/phases';
import type { AxisValue } from '$lib/types/layout/mapping';

/** BoxPlot's pipeline state: the shared axis-based state, with no extras of its own. */
export type BoxPlotState<TData extends Record<string, unknown>> = AxisPlotState<TData, AreaStyle>;

/** The environment every BoxPlot phase reads from, alongside the growing state. */
export type BoxPlotCtx = AxisPlotCtx;

/**
 * One box's summary - what a hovered box reads as: its category, its
 * quartiles, the whisker ends (the farthest values within 1.5 IQR of the
 * box) and the values past them. It also keeps the series tags and, when the
 * category channel is a field key, the category under that field.
 */
export type BoxSummaryRow = ProcessedRow & {
	category: AxisValue;
	min: number;
	p25: number;
	median: number;
	p75: number;
	max: number;
	count: number;
	outliers: number[];
};
