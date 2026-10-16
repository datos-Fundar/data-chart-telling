/**
 * A grammar-of-graphics layer - facet, data, mapping, transforms, statistics,
 * scales, markers, coordinates - plus `sharedScales`, the domains every slice
 * of a plot shares, `tooltip`, how a hovered row reads once
 * everything it reads from is placed, and `hover`, what the pointer can match.
 */
export type PlotPhase =
	| 'facet'
	| 'data'
	| 'mapping'
	| 'transforms'
	| 'statistics'
	| 'sharedScales'
	| 'scales'
	| 'styles'
	| 'markers'
	| 'coordinates'
	| 'tooltip'
	| 'hover';

/** A resolution step for one {@link PlotPhase} - same state shape in and out. Each shared phase is a class (`DataPhase`, `HoverPhase`...) that implements it. */
export type PhaseStage<TState, TCtx = unknown> = {
	phase: PlotPhase;
	run: (state: TState, ctx: TCtx) => TState;
};
