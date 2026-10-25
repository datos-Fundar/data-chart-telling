import type { Series } from '$lib/types/plots/data/common';
import type { FacetPanel, FacetStageState } from '$lib/types/phases';

/** The state fields narrowing to some panels filters. */
type NarrowableState = FacetStageState & {
	resolvedSeries?: Series<Record<string, unknown>>[];
	flat?: unknown[];
	scopedGroups?: { panel?: string }[];
	groupedSeries?: { series: { panel?: string } }[];
	processedData?: { data: Record<string | symbol, unknown>[] };
	processedGroups?: { series: { panel?: string } }[];
	labelled?: Record<string | symbol, unknown>[];
};

/** The field a processed row carries its facet panel under. */
export const PANEL_KEY = '__panel';

/**
 * What the "facet" phase's panels do to the rest of a plot's state: each
 * series split into one per panel, a state narrowed to some panels, and one
 * panel's part of a run over every panel.
 */
export class FacetPanels {
	/** The id of a series' part in one facet panel. */
	static buildSeriesId(panel: string, name: string): string {
		return `${panel}\u0000${name}`;
	}

	/**
	 * Each series split into one per facet panel, panel by panel: the same
	 * `name` (and so the same color and legend entry), its own `id` and `panel`,
	 * and only that panel's rows. A series with no rows in a panel has no part there.
	 */
	static splitSeries<S extends Series<Record<string, unknown>>>(
		series: S[],
		panels: FacetPanel[],
		panelOf: NonNullable<FacetStageState['panelOf']>
	): S[] {
		const rowsByPanel = series.map((s) => {
			const groups = new Map<string, Record<string, unknown>[]>();
			for (const row of s.data) {
				const key = panelOf(row);
				if (key === undefined) continue;
				const bucket = groups.get(key);
				if (bucket) bucket.push(row);
				else groups.set(key, [row]);
			}
			return groups;
		});
		return panels.flatMap((panel) =>
			series.flatMap((s, i) => {
				const rows = rowsByPanel[i].get(panel.key);
				if (!rows?.length) return [];
				return [
					{
						...s,
						id: FacetPanels.buildSeriesId(panel.key, s.name),
						panel: panel.key,
						data: rows
					}
				];
			})
		);
	}

	/** A state narrowed to one panel's series, rows and processed rows. */
	static narrowToPanel<TState extends NarrowableState>(state: TState, panel: string): TState {
		return FacetPanels.narrowToPanels(state, [panel]);
	}

	/** A state narrowed to some panels' series, rows and processed rows. */
	static narrowToPanels<TState extends NarrowableState>(
		state: TState,
		panels: readonly string[]
	): TState {
		const keep = new Set(panels);
		const has = (panel: unknown) => keep.has(panel as string);
		const resolvedSeries = state.resolvedSeries?.filter((s) => has(s.panel));
		const { panelOf } = state;
		return {
			...state,
			resolvedSeries,
			flat: panelOf
				? state.flat?.filter((row) => has(panelOf(row as Record<string, unknown>)))
				: resolvedSeries?.flatMap((s) => s.data),
			scopedGroups: state.scopedGroups?.filter((g) => has(g.panel)),
			groupedSeries: state.groupedSeries?.filter((g) => has(g.series.panel)),
			processedGroups: state.processedGroups?.filter((g) => has(g.series.panel)),
			labelled: state.labelled?.filter((row) => has(row[PANEL_KEY])),
			processedData: state.processedData && {
				...state.processedData,
				data: state.processedData.data.filter((row) => has(row[PANEL_KEY]))
			}
		};
	}

	/**
	 * One facet panel's part of a run of the data phases over every panel: its
	 * series, rows, processed rows and markers, without the facet itself, ready
	 * for the phases each panel runs on its own.
	 */
	static buildPanelState<
		TState extends FacetStageState & {
			resolvedSeries?: Series<Record<string, unknown>>[];
			markers?: object[];
		}
	>(state: TState, panel: string): Omit<TState, 'facet' | 'panels' | 'panelOf'> {
		const narrowed = FacetPanels.narrowToPanel(state as never, panel) as TState;
		const markers = state.markers?.flatMap((marker) => {
			const own = marker as Record<string, unknown>;
			if (own[PANEL_KEY] === undefined) return [marker];
			if (own[PANEL_KEY] !== panel) return [];
			const untagged = { ...own };
			delete untagged[PANEL_KEY];
			return [untagged];
		});
		const out: Partial<TState> = { ...narrowed, markers };
		delete out.facet;
		delete out.panels;
		delete out.panelOf;
		return out as Omit<TState, 'facet' | 'panels' | 'panelOf'>;
	}
}
