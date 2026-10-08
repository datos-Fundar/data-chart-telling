/** What differs between plots in the shared "tooltip" stage. */
export type TooltipStageOptions<TState, TCtx> = {
	/** How a hovered row reads. Defaults to `x: y` off the processed channels, under its series when grouped. */
	format?: (state: TState, ctx: TCtx) => (row: Record<string, unknown>) => string;
};
