/**
 * A grammar-of-graphics layer - data, mapping, transforms, statistics, scales,
 * markers, coordinates, facet - plus `tooltip`, how a hovered row reads once
 * everything it reads from is placed.
 */
export type PlotPhase =
	| 'data'
	| 'mapping'
	| 'transforms'
	| 'statistics'
	| 'scales'
	| 'markers'
	| 'coordinates'
	| 'tooltip'
	| 'facet';

/** A resolution step for one {@link PlotPhase} - same state shape in and out. */
export type PhaseStage<TState, TCtx = unknown> = {
	phase: PlotPhase;
	run: (state: TState, ctx: TCtx) => TState;
};
