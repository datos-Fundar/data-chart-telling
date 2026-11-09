import type { AreaStyle } from '$lib/types/plots/styling';
import type { AxisPlotState, AxisPlotEnv, ProcessedRow } from '$lib/types/phases';
import type { BoxSummary } from '$lib/types/plots/distribution/box/props';

/** BoxPlot's pipeline state: the shared axis-based state, with no extras of its own. */
export type BoxPlotState<TData extends Record<string, unknown>> = AxisPlotState<TData, AreaStyle>;

/** The environment every BoxPlot phase reads from, alongside the growing state. */
export type BoxPlotEnv = AxisPlotEnv;

/**
 * One box's summary as a row - what a hovered box reads as. It also keeps the series tags and, when the category
 * channel is a field key, the category under that field.
 */
export type BoxSummaryRow = ProcessedRow & BoxSummary;
