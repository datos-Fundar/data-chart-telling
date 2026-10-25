import type {
	ClevelandPlotState,
	ClevelandPlotCtx
} from '$lib/types/plots/ranking/cleveland/state';

/** ForestPlot's pipeline state: a ClevelandPlot's. */
export type ForestPlotState<TData extends Record<string, unknown>> = ClevelandPlotState<TData>;

/** The environment every ForestPlot phase reads from, alongside the growing state. */
export type ForestPlotCtx = ClevelandPlotCtx;
