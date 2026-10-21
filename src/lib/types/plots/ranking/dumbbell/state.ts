import type {
	ClevelandPlotState,
	ClevelandPlotCtx
} from '$lib/types/plots/ranking/cleveland/state';

/** DumbbellPlot's pipeline state: a ClevelandPlot's. */
export type DumbbellPlotState<TData extends Record<string, unknown>> = ClevelandPlotState<TData>;

/** The environment every DumbbellPlot phase reads from, alongside the growing state. */
export type DumbbellPlotCtx = ClevelandPlotCtx;
