import { buildSeries, Grouping } from '$lib/utils/grouping';
import { ColorRamp, ColorTones } from '$lib/utils/color';
import { resolveAccessor } from '$lib/utils/accessors';
import { buildGroupedSeries, buildScopedMarkerGroups } from '$lib/plots/utils/segments';
import { buildGapFillMaps, isGapValue } from '$lib/plots/utils/gaps';
import { BasicStyles } from '$lib/layout/styles/BasicStyles';
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
		const { connect = true, color: segmentColor } = options.segments ?? {};

		const seriesGrouping = DataPhase.#buildGrouping(state, options.nested);
		const built: Series[] = series ?? buildSeries(data ?? [], state.x, state.y, seriesGrouping);
		const fullSeries = options.orderSeries ? options.orderSeries(built, state) : built;
		const axes = PlotAxes.build({
			series: fullSeries,
			scales,
			given: { x: state.x !== undefined, y: state.y !== undefined },
			discrete: options.discreteAxes
		});
		const seriesColors = ColorRamp.resolve(
			scales.color,
			(options.colorOrder ? options.colorOrder(fullSeries) : fullSeries).map((s) => s.name),
			ctx.cfg.palette
		);
		const colorForPath = series ? undefined : DataPhase.#buildPathColors(state, ctx);
		// A plot that splits its series by every level colors each one by its path; a nested one by its outermost.
		const colorForSeries =
			colorForPath && !options.nested
				? DataPhase.#byPath(state, colorForPath, seriesColors)
				: seriesColors;
		const panelSeries =
			state.panels && state.panelOf && !series
				? FacetPanels.splitSeries(fullSeries, state.panels, state.panelOf)
				: fullSeries;
		const legend = ctx.interaction?.legend;
		const resolvedSeries = legend?.withoutOmitted(panelSeries) ?? panelSeries;
		const removedSeries = legend?.removed(panelSeries);
		const baseFor = BasicStyles.of(state.styles, options.segments?.base);
		const groupedSeries = buildGroupedSeries(resolvedSeries, segments, connect, baseFor);
		const scopedGroups = buildScopedMarkerGroups({
			groupedSeries,
			segments,
			baseFor,
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
			...(removedSeries ? { removedSeries } : {}),
			seriesGrouping,
			allSeriesNames: fullSeries.map((s) => s.name),
			groupedSeries,
			segmentBase: baseFor,
			flat: resolvedSeries.flatMap((s) => s.data),
			scopedGroups,
			colorForSeries,
			...(colorForPath ? { colorForPath } : {}),
			...(gapFillMaps ? { gapFillMaps } : {})
		} as TState;
		return options.extend ? options.extend(next, ctx) : next;
	};

	/**
	 * The color of a path of the plot's `grouping` levels, when `scales.color.depth` reaches past the outermost
	 * one: each outermost value its categorical color, and every path down to `depth` a tone of it (see
	 * {@link ColorTones.hierarchy}). `undefined` for a grouping of one level, or a depth of 1.
	 */
	static #buildPathColors(
		state: AnyAxisState,
		ctx: AxisPlotCtx
	): ((path: readonly string[]) => string) | undefined {
		const depth = state.scales.color?.depth ?? 1;
		const rows = state.data ?? [];
		const levels = Grouping.levels(state.grouping, rows).map((level) =>
			resolveAccessor(level as never)
		) as ((row: unknown) => unknown)[];
		if (depth <= 1 || levels.length <= 1) return undefined;
		const paths = rows.map((row) => levels.map((read) => String(read(row))));
		const outermost = [...new Set(paths.map((path) => path[0]))];
		const colorOf = ColorRamp.resolve(state.scales.color, outermost, ctx.cfg.palette);
		return ColorTones.hierarchy(paths, depth, (value) => colorOf(value));
	}

	/** A series' color as the color of its path - its name is the key its levels make together. */
	static #byPath(
		state: AnyAxisState,
		colorForPath: (path: readonly string[]) => string,
		fallback: (name: string) => string
	): (name: string) => string {
		const rows = state.data ?? [];
		const key = resolveAccessor(Grouping.key(state.grouping, rows) as never) as (
			row: unknown
		) => unknown;
		const levels = Grouping.levels(state.grouping, rows).map((level) =>
			resolveAccessor(level as never)
		) as ((row: unknown) => unknown)[];
		const pathOf = new Map<string, string[]>();
		for (const row of rows) {
			const name = String(key(row));
			if (!pathOf.has(name))
				pathOf.set(
					name,
					levels.map((read) => String(read(row)))
				);
		}
		return (name) => {
			const path = pathOf.get(name);
			return path ? colorForPath(path) : fallback(name);
		};
	}

	/**
	 * The key a plot's rows split into series by: its `grouping` (its levels together, or the outermost
	 * one alone for a `nested` kind), or its `color` when that names categories. A numeric `color` is a
	 * continuous value (a heatmap's cells), so it colors rows without grouping them.
	 */
	static #buildGrouping(
		state: Pick<AnyAxisState, 'grouping' | 'color' | 'data'>,
		nested = false
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Accessor<any, unknown> | undefined {
		if (state.grouping !== undefined) return Grouping.key(state.grouping, state.data, nested);
		const color = state.color;
		if (color === undefined || !state.data) return color;
		const read = resolveAccessor(color as never) as (row: unknown) => unknown;
		const values = state.data.map(read).filter((v) => !isGapValue(v));
		const continuous = values.length > 0 && values.every((v) => typeof v === 'number');
		return continuous ? undefined : color;
	}
}
