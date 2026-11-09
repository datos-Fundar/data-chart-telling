import type { LinePlotState, LinePlotEnv } from '$lib/types/plots/evolution/line/state';

/** SlopePlot's pipeline state: a LinePlot's. */
export type SlopePlotState<TData extends Record<string, unknown>> = LinePlotState<TData>;

/** The environment every SlopePlot phase reads from, alongside the growing state. */
export type SlopePlotEnv = LinePlotEnv;
