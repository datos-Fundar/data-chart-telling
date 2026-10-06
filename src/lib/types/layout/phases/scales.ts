import type { AxisChannelName } from '$lib/types/layout/mapping';

/** What differs between plots in the shared "scales" stage. */
export type ScalesStageOptions<TState, TCtx> = {
	/** Axes whose marks grow from zero, so a domain this stage sets still reaches it. */
	zero?: AxisChannelName[];
	/** Replaces the shared stage with the plot's own scale resolution. */
	override?: (state: TState, ctx: TCtx) => TState;
};
