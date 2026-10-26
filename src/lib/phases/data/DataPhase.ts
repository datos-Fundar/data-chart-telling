import { buildSeries } from '$lib/utils/grouping';
import { ColorRamp } from '$lib/utils/color';
import { resolveAccessor } from '$lib/utils/accessors';
import { buildGroupedSeries, buildScopedMarkerGroups } from '$lib/plots/utils/segments';
import { buildGapFillMaps, isGapValue } from '$lib/plots/utils/gaps';
import { FacetPanels } from '$lib/phases/facet/FacetPanels';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { Accessor, Series } from '$lib/types/plots/data/common';
import type { AxisPlotState, AxisPlotCtx, DataStageOptions, PhaseStage } from '$lib/types/phases';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAxisState = AxisPlotState<any, any, any, any>;

/**
 * The "data" phase every axis-based plot shares: its series (from `series`,
 * or flat rows split by `seriesGrouping`: its `grouping`, or a categorical
 * `color`), what each position channel is and which way the plot runs
 * ({@link PlotAxes}), each series' color, the series a legend omits dropped,
 * each series cut into its styled visual segments, and - for a discrete
 * mark - the values its gaps fill in.
 * Colors and axes come from every series, before any is omitted or split by
 * facet panel, so they stay put and every panel agrees.
 */
export class DataPhase<TState extends AnyAxisState, TCtx extends AxisPlotCtx> implements PhaseStage<
	TState,
	TCtx
> {
	readonly phase = 'data' as const;
	readonly #options: DataStageOptions<TState, TCtx>;

	constructor(options: DataStageOptions<TState, TCtx> = {}) {
		this.#options = options;
	}

	run = (state: TState, ctx: TCtx): TState => {
		const options = this.#options;
		const { series, data, segments, scales } = state;
		const { connect = true, gather = false, color: segmentColor } = options.segments ?? {};

		const seriesGrouping = DataPhase.#buildGrouping(state);
		const built: Series[] = series ?? buildSeries(data ?? [], state.x, state.y, seriesGrouping);
		const fullSeries = options.orderSeries ? options.orderSeries(built, state) : built;
		const axes = PlotAxes.build({
			series: fullSeries,
			scales,
			given: { x: state.x !== undefined, y: state.y !== undefined },
			discrete: options.discreteAxes
		});
		const colorForSeries = ColorRamp.resolve(
			scales.color,
			(options.colorOrder ? options.colorOrder(fullSeries) : fullSeries).map((s) => s.name),
			ctx.cfg.palette
		);
		const panelSeries =
			state.panels && state.panelOf && !series
				? FacetPanels.splitSeries(fullSeries, state.panels, state.panelOf)
				: fullSeries;
		const resolvedSeries = ctx.interaction?.legend?.withoutOmitted(panelSeries) ?? panelSeries;
		const groupedSeries = buildGroupedSeries(resolvedSeries, segments, connect, gather);
		const scopedGroups = buildScopedMarkerGroups({
			groupedSeries,
			segments,
			colorFor: (s) => colorForSeries(s.name),
			segmentColorFor: (style, defaultColor) => segmentColor?.(style) ?? defaultColor
		});
		// A continuous mark bridges its gaps instead (see `buildGapMarkers`).
		const gapFillMaps = connect
			? undefined
			: buildGapFillMaps(resolvedSeries, state.gaps, axes.value);

		const next = {
			...state,
			axes,
			resolvedSeries,
			seriesGrouping,
			allSeriesNames: fullSeries.map((s) => s.name),
			groupedSeries,
			flat: resolvedSeries.flatMap((s) => s.data),
			scopedGroups,
			colorForSeries,
			...(gapFillMaps ? { gapFillMaps } : {})
		} as TState;
		return options.extend ? options.extend(next, ctx) : next;
	};

	/**
	 * The key a plot's rows split into series by: its `grouping`, or its `color`
	 * when that names categories. A numeric `color` is a continuous value (a
	 * heatmap's cells), so it colors rows without grouping them.
	 */
	static #buildGrouping(
		state: Pick<AnyAxisState, 'grouping' | 'color' | 'data'>
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Accessor<any, unknown> | undefined {
		if (state.grouping !== undefined) return state.grouping;
		const color = state.color;
		if (color === undefined || !state.data) return color;
		const read = resolveAccessor(color as never) as (row: unknown) => unknown;
		const values = state.data.map(read).filter((v) => !isGapValue(v));
		const continuous = values.length > 0 && values.every((v) => typeof v === 'number');
		return continuous ? undefined : color;
	}
}
