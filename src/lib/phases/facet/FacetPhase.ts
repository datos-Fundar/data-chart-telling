import { buildFacetKeyOf, buildFacetPanels } from '$lib/layout/facet/config';
import type { FacetConfig } from '$lib/types/layout/facet';
import type { FacetStageState, PhaseStage } from '$lib/types/phases';
import { PANEL_KEY } from '$lib/phases/facet/FacetPanels';
import { FacetScope } from '$lib/layout/facet/scope';

/**
 * The "facet" phase: the panels the plot's `facet` lays its rows out in, and
 * which panel each row belongs to. It runs first, so the "data" phase builds
 * every series already split by panel. A plot drawn from pre-built `series`
 * has no rows to split, so its facet is ignored. The plot's `segments` and markers that name a facet
 * are handed to the panels they name here, once, for every later phase.
 */
export class FacetPhase<TState extends FacetStageState> implements PhaseStage<TState> {
	readonly phase = 'facet' as const;

	run = (state: TState): TState => {
		const { data, series } = state;
		const facet = state.facet as FacetConfig<Record<string, unknown>> | undefined;
		// Without panels, a segment or a marker that names a facet has none to be drawn in.
		if (!facet || series || !data) {
			return {
				...state,
				segments: FacetScope.scopeSegments(state.segments, undefined),
				authorMarkers: FacetScope.scope(state.authorMarkers, undefined)
			};
		}
		const panels = buildFacetPanels(facet, data).map(({ rows: _rows, ...panel }) => panel);
		const keys = new Set(panels.map((p) => p.key));
		const keyOf = buildFacetKeyOf(facet);
		const panelOf = (row: Record<string | symbol, unknown>) => {
			const tagged = row[PANEL_KEY];
			if (typeof tagged === 'string') return tagged;
			const key = keyOf(row as Record<string, unknown>);
			return keys.has(key) ? key : undefined;
		};
		// Every later phase reads each panel's own segments and markers: nothing past here knows of `facet`.
		return {
			...state,
			panels,
			panelOf,
			segments: FacetScope.distributeSegments(state.segments, panels),
			authorMarkers: FacetScope.distributeMarkers(state.authorMarkers, panels)
		};
	};
}
