/** What differs between plots in the shared "mapping" stage. */
export type MappingStageOptions<TState, TCtx> = {
	/** The plot's own extra "mapping" output, once every channel is resolved. */
	extend?: (state: TState, ctx: TCtx) => TState;
};
