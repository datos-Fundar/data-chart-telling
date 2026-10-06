import type { Accessor } from '$lib/types/plots/data/common';

/** What differs between plots in the shared "mapping" stage. */
export type MappingStageOptions<TState, TCtx> = {
	/** The row-level grouping channel. Defaults to `grouping ?? color`. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	grouping?: (state: TState) => Accessor<any, unknown> | undefined;
	/** The plot's own extra "mapping" output, once every channel is resolved. */
	extend?: (state: TState, ctx: TCtx) => TState;
};
