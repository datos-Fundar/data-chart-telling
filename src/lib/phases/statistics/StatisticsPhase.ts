import { AuthorMarkers } from '$lib/phases/statistics/AuthorMarkers';
import { Statistics } from '$lib/phases/statistics/Statistics';
import { PANEL_KEY, FacetPanels } from '$lib/phases/facet/FacetPanels';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { PhaseStage, StatisticsStageOptions, StatisticsStageState } from '$lib/types/phases';

/** Marker kinds that draw from a channel pair, so they take the plot's `x`/`y` when the author leaves one out. */
const POSITIONED_KINDS = new Set(['line', 'area', 'dot']);

/**
 * The "statistics" phase every axis-based plot shares: seeds `state.markers`
 * with the plot-level `statistics` resolved against every series, followed by
 * the author's own markers, each one inheriting the plot's grouping and color,
 * drawing the plot's processed rows when it has none of its own (see
 * `withProcessedRows`), running its own `transforms`, and expanding its own
 * `.statistics` in place.
 * Authored markers render on top of the plot-level ones. Later phases build
 * onto `state.markers`. With facet panels, all of it resolves once per panel,
 * over that panel's series and rows, and each marker is tagged with its panel.
 */
export class StatisticsPhase<TState extends StatisticsStageState> implements PhaseStage<TState> {
	readonly phase = 'statistics' as const;
	readonly #options: StatisticsStageOptions<TState>;

	constructor(options: StatisticsStageOptions<TState> = {}) {
		this.#options = options;
	}

	run = (state: TState): TState => {
		if (!state.panels) return { ...state, markers: this.#resolve(state) };
		const markers = state.panels.flatMap((panel) =>
			this.#resolve(this.#ownTo(FacetPanels.narrowToPanel(state, panel.key), panel.key)).map(
				(marker) => ({ ...marker, [PANEL_KEY]: panel.key }) as unknown as AxisBasedMarkersConfig
			)
		);
		return { ...state, markers };
	};

	/** `state` with the author's markers that the "facet" phase tagged for another panel left out. */
	#ownTo(state: TState, panel: string): TState {
		const authorMarkers = state.authorMarkers?.filter((marker) => {
			const tagged = (marker as Record<string, unknown>)[PANEL_KEY];
			return tagged === undefined || tagged === panel;
		});
		return { ...state, authorMarkers };
	}

	#resolve(state: TState): AxisBasedMarkersConfig[] {
		const options = this.#options;
		const {
			resolvedSeries = [],
			flat = [],
			colorForSeries,
			statistics,
			authorMarkers = []
		} = state;
		const { inheritGrouping = true, inheritPositions = false } = options;

		const defaultColor = options.defaultColor
			? options.defaultColor(state)
			: resolvedSeries[0] && colorForSeries?.(resolvedSeries[0].name);

		const onProcessed = authorMarkers.map((marker) =>
			AuthorMarkers.withProcessedRows(marker, state.processedData)
		);
		const positioned = inheritPositions
			? onProcessed.map((marker) => {
					if (!POSITIONED_KINDS.has(marker.type)) return marker;
					const own = marker as AxisBasedMarkersConfig & { x?: unknown; y?: unknown };
					return {
						...own,
						x: own.x ?? resolvedSeries[0]?.x ?? state.x,
						y: own.y ?? resolvedSeries[0]?.y ?? state.y
					} as AxisBasedMarkersConfig;
				})
			: onProcessed;

		// A series setting no value of its own (a histogram's) measures its processed rows: its bins.
		const valueAxis = PlotAxes.valueOf(state);
		const measured =
			state.processedData && resolvedSeries.some((s) => s[valueAxis] === undefined)
				? (state.processedGroups ?? []).map((group) => group.series)
				: resolvedSeries;

		return [
			...Statistics.buildForPlot({
				series: measured,
				statistics,
				valueAxis,
				colorFor: colorForSeries
			}),
			...Statistics.expandMarkers(
				AuthorMarkers.prepare(positioned, {
					grouping: inheritGrouping ? state.grouping : undefined,
					color: inheritGrouping ? state.color : undefined,
					defaultColor,
					flat,
					resolvedSeries,
					scopedGroups: state.scopedGroups
				}),
				flat,
				valueAxis
			)
		];
	}
}
