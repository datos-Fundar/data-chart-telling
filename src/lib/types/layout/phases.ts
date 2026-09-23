/** A grammar-of-graphics layer: data, mapping, statistics (marker or plot level), scales, markers, coordinates, facet. */
export type PlotPhase =
	| 'data'
	| 'mapping'
	| 'statistics-marker'
	| 'statistics-plot'
	| 'scales'
	| 'markers'
	| 'coordinates'
	| 'facet';

/** A resolution step for one {@link PlotPhase} — same state shape in and out. */
export type PhaseStage<TState, TCtx = unknown> = {
	phase: PlotPhase;
	run: (state: TState, ctx: TCtx) => TState;
};
