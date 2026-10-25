import type { LinePlotState, LinePlotCtx } from '$lib/types/plots/evolution/line/state';

/** SparklinePlot's pipeline state: a LinePlot's. */
export type SparklinePlotState<TData extends Record<string, unknown>> = LinePlotState<TData>;

/** The environment every SparklinePlot phase reads from, alongside the growing state. */
export type SparklinePlotCtx = LinePlotCtx;
