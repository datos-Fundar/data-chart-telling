import type {
	ClevelandPlotState,
	ClevelandPlotCtx
} from '$lib/types/plots/ranking/cleveland/state';

/** LollipopPlot's pipeline state: a ClevelandPlot's. */
export type LollipopPlotState<TData extends Record<string, unknown>> = ClevelandPlotState<TData>;

/** The environment every LollipopPlot phase reads from, alongside the growing state. */
export type LollipopPlotCtx = ClevelandPlotCtx;
