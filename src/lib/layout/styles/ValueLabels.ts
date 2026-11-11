import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { Box } from '$lib/layout/margins/Box';
import { resolveAccessor } from '$lib/utils/accessors';
import { SERIES_ID_KEY, SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { seriesIdOf } from '$lib/utils/grouping';
import { isGapValue } from '$lib/plots/utils/gaps';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { NumberFormat } from '$lib/utils/NumberFormat';
import { RowContext } from '$lib/phases/context/RowContext';
import type { PlotRowContext } from '$lib/types/layout/context';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { ValuePartOptions, ValuesFontStyle, ValuesStyle } from '$lib/types/layout/styles';
import type { ValueLabelsOptions } from '$lib/types/phases/styles/phase';
import type { Series } from '$lib/types/plots/data/common';
import type { FontStyle, StrokeStyle } from '$lib/types/plots/styling';
import type { BoxAnchors, EdgeBox } from '$lib/types/layout/box';
import type { MarginSide } from '$lib/types/plots/props';
import type { AxisPlotEnv, AxisPlotState, ProcessedData, ProcessedRow } from '$lib/types/phases';
import type { TextMarkerConfig } from '$lib/types/markers/common';
import type { LabelLayout, MarkerLabelConfig } from '$lib/types/markers/labels/common';
import type { PointGeometryOf, PointLabelConfig, PointSide } from '$lib/types/markers/labels/point';
import type { BoxScales } from '$lib/types/markers/labels/box';
import { PointLayout } from '$lib/markers/labels/layouts/PointLayout';

/** One part of each row a plot labels, with where its label sits and how it writes it. */
type ValuePart = {
	name: string;
	placement: Record<string, unknown>;
	format: (value: number, row?: object, series?: string, part?: string) => string;
};

/** Where a part's value sits on the row a part label copies. */
const PART_VALUE = Symbol('partValue');

/** The options of `styles.values` that place a label in its layout. */
const LAYOUT_KEYS = ['anchor', 'edge', 'side', 'offset', 'gap'] as const;

/**
 * A plot's value labels: the author's `styles.values` over the plot kind's
 * own defaults, how their text measures, where they are expected to sit
 * (`reach`, which the plot's margins keep room for), and what every label marker shares
 * ({@link hooks}). The "markers" phase draws them.
 */
export class ValueLabels {
	readonly show: boolean;
	/** How the labels are laid out on their shapes: the author's `layout`, else the kind's. */
	readonly layout: LabelLayout;
	/** The options that place a label in its {@link layout}: the author's over the kind's own for it. */
	readonly placement: Record<string, unknown>;
	/** The parts of each row labelled - a simple plot's one `value`, a box's `median`... - each with its own options. */
	readonly parts: ValuePart[];
	/** The series whose rows are labelled, when `styles.values.series` names some; every series else. */
	readonly series: string[] | undefined;
	/** Whether the author gave the labels a text of their own, beyond the value. */
	readonly formatted: boolean;
	/**
	 * A label's text for `value`: the author's `format`, else the kind's, else the value as the display fields ask.
	 * `row` is the row it labels, whose context the format reads; `series` names its series where there is no row
	 * (a label measured ahead of the rows); `part`, which of the row's values it writes.
	 */
	readonly format: (value: number, row?: object, series?: string, part?: string) => string;
	readonly hoverIsolate: boolean;
	readonly font: ValuesFontStyle | undefined;
	readonly fontSize: number;
	/** The connectors of labels that had to move apart. */
	readonly strokeStyle: StrokeStyle | undefined;
	/** `'series'` writes each label in its series' color; any other CSS color writes them all in it. */
	readonly color: 'series' | string | undefined;
	/** How labels that would overlap move apart - the configuration's `text.declutter`. */
	readonly declutter: PlotStylesConfig['text']['declutter'];
	/** Where the labels are expected to sit: boxes around their points, on the edges those can reach. */
	readonly reach: EdgeBox[];
	readonly #cfg: PlotStylesConfig;

	constructor(
		values: ValuesStyle | undefined,
		cfg: PlotStylesConfig,
		options: Omit<
			ValueLabelsOptions<never>,
			'reach' | 'layout' | 'layouts' | 'parts' | 'formatFor'
		> & {
			layout?: LabelLayout;
			layouts?: Partial<Record<LabelLayout, Record<string, unknown>>>;
			parts?: { placements: Record<string, Record<string, unknown>>; default: string[] };
		} = {},
		reach?: (labels: ValueLabels) => EdgeBox[]
	) {
		this.layout = values?.layout ?? options.layout ?? 'point';
		const own = Object.fromEntries(
			LAYOUT_KEYS.flatMap((key) => {
				const value = (values as Record<string, unknown> | undefined)?.[key];
				return value === undefined ? [] : [[key, value]];
			})
		);
		// The value as the display fields ask (else as it is), which a plot kind's own text builds on.
		const number =
			NumberFormat.maybe(NumberFormat.displayOf(values), cfg) ?? ((v: number) => `${v}`);
		const writer =
			(write: ValuesStyle['format']): ValueLabels['format'] =>
			(v, row, series, part) =>
				write
					? write(v, number, { ...ValueLabels.contextOf(row, series), ...(part ? { part } : {}) })
					: number(v);
		this.format = writer(values?.format ?? options.format);
		this.parts = ValueLabels.#parts(values?.parts, options.parts).map(([name, own_]) => {
			const { format, ...placement } = own_ as ValuePartOptions;
			return {
				name,
				placement: {
					...options.layouts?.[this.layout],
					...options.parts?.placements[name],
					...own,
					...placement
				},
				format: format ? writer(format) : this.format
			};
		});
		this.placement = this.#part('value')?.placement ?? {
			...options.layouts?.[this.layout],
			...own
		};
		this.formatted =
			values?.format !== undefined ||
			!!(values?.parts as Record<string, { format?: unknown }> | undefined)?.value?.format;
		this.show = ValueLabels.shows(values, options.show) && this.parts.length > 0;
		this.hoverIsolate = values?.hoverIsolate ?? false;
		this.series = values?.series === undefined ? undefined : [values.series].flat();
		this.font = values?.fontStyle;
		this.fontSize = typeof this.font?.fontSize === 'number' ? this.font.fontSize : 12;
		this.strokeStyle = values?.strokeStyle;
		this.color = values?.color;
		this.declutter = cfg.text.declutter;
		this.#cfg = cfg;
		this.reach = (this.show && reach?.(this)) || [];
	}

	/** Whether the part named `name` is labelled: a plot writing its `value` on its own shapes asks first. */
	writes(name: string): boolean {
		return this.#part(name) !== undefined;
	}

	/** The part named `name`, when it is labelled. */
	#part(name: string): ValuePart | undefined {
		return this.parts.find((part) => part.name === name);
	}

	/** The parts labelled, each with its own options: the author's list or record, else the kind's default ones. */
	static #parts(
		own: ValuesStyle['parts'],
		kind: { default: string[] } | undefined
	): [string, ValuePartOptions][] {
		if (own === undefined) return (kind?.default ?? ['value']).map((name) => [name, {}]);
		if (Array.isArray(own)) return own.map((name) => [name, {}]);
		return Object.entries(own).flatMap(([name, option]): [string, ValuePartOptions][] =>
			option ? [[name, option === true ? {} : option]] : []
		);
	}

	/** Whether the labels draw: `show` as set, else when any other option of them is set, else the kind's default. */
	static shows(values: ValuesStyle | undefined, fallback = false): boolean {
		if (values?.show !== undefined) return values.show;
		const set = Object.entries(values ?? {}).some(
			([key, value]) => key !== 'show' && value !== undefined
		);
		return set || fallback;
	}

	/** The context a label's `format` reads: its row's, with `series` when the row gives none. */
	static contextOf(row: object | undefined, series?: string): PlotRowContext {
		const context = RowContext.of(row);
		return context.series === undefined && series !== undefined ? { ...context, series } : context;
	}

	/**
	 * The value a label writes for `row`, read off its context: its `value`, or one `part` of it on a plot whose rows
	 * have several. `undefined` when it is not a number.
	 */
	static valueIn(row: object | undefined, part = 'value'): number | undefined {
		const value = (RowContext.of(row) as Record<string, unknown>)[part];
		return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
	}

	/** A label's text for `row`: its context's `part` (its `value` by default), as that part's format writes it. */
	text(row: object, part = 'value'): string {
		const value = ValueLabels.valueIn(row, part);
		const format = this.#part(part)?.format ?? this.format;
		return value === undefined ? '' : format(value, row, undefined, part);
	}

	/** A plot's value labels: `values` over `options`, the kind's own defaults, their reach read off `state`. */
	static build<TState>(
		values: ValuesStyle | undefined,
		cfg: PlotStylesConfig,
		options: ValueLabelsOptions<TState>,
		state: TState
	): ValueLabels {
		const { reach, layout, layouts, parts, formatFor } = options;
		return new ValueLabels(
			values,
			cfg,
			{
				...options,
				layout: typeof layout === 'function' ? layout(state) : layout,
				format: options.format ?? formatFor?.(state),
				layouts: typeof layouts === 'function' ? layouts(state) : layouts,
				parts: parts && {
					...parts,
					placements:
						typeof parts.placements === 'function' ? parts.placements(state) : parts.placements
				}
			},
			reach && ((labels) => reach(labels, state))
		);
	}

	/** Whether the labels sit past the tip of their shapes, where the plot's margins keep room for them. */
	get pastTip(): boolean {
		const { edge = 'tip', side = 'outside' } = this.placement;
		return this.layout === 'path' && edge === 'tip' && side === 'outside';
	}

	/**
	 * The `label` a plot kind's shapes write their value in, in this plot's {@link layout}: `text`, over what every
	 * label shares ({@link hooks}). Inside its shape a label takes no `fill` of its own, so it is written in the color
	 * that reads best on the shape; past it, the plot's `fill`.
	 */
	label<TLabel extends MarkerLabelConfig = MarkerLabelConfig>(
		env: AxisPlotEnv,
		text: (row: ProcessedRow) => string,
		defaults: {
			fill?: string;
			fontSize?: number;
			fontWeight?: FontStyle['fontWeight'];
			/** The rows `styles.values.select` picks: a `'point'` label writes only theirs. */
			labelled?: readonly ProcessedRow[];
			/** A row's series color, which `color: 'series'` writes a label off its shape in. */
			seriesColor?: (row: ProcessedRow) => string | undefined;
		} = {}
	): TLabel {
		const { fitMargins, styles: shared, ...events } = this.hooks(env);
		const { font } = this;
		const onShape = this.layout === 'box' || this.placement.side === 'inside';
		const picked = this.layout === 'point' && defaults.labelled && new Set(defaults.labelled);
		return {
			...events,
			...this.placement,
			...(picked ? { select: (row: ProcessedRow) => picked.has(row) } : {}),
			layout: this.layout,
			text,
			fitMargins: onShape ? undefined : fitMargins,
			styles: {
				...shared,
				...font,
				// On its shape, a label unset reads in the color that contrasts with it; off it, in its own.
				fill: onShape
					? this.fill
					: (this.fill ??
						(this.color === 'series' ? defaults.seriesColor : undefined) ??
						defaults.fill),
				fontSize: font?.fontSize ?? defaults.fontSize ?? 12,
				fontWeight: font?.fontWeight ?? defaults.fontWeight
			}
		} as TLabel;
	}

	/** The configuration the labels were built under, for a plot kind's own label defaults. */
	get config(): PlotStylesConfig {
		return this.#cfg;
	}

	/**
	 * The fill every label takes whatever its series: the author's own
	 * `fontStyle.fill`, else a literal `color`. `undefined` leaves each label to
	 * its plot's default (its series' color, or the axis').
	 */
	get fill(): string | undefined {
		return this.font?.fill ?? (this.color === 'series' ? undefined : this.color);
	}

	/** One line of label text's height. */
	get lineHeight(): number {
		return this.fontSize * 1.2;
	}

	/** The box one label's `text` takes. */
	textBox(text: string): Box {
		return Box.ofText(text, this.fontSize, this.#cfg);
	}

	/** The labels' gap (px) from their mark: the layout's `gap`, else `fallback`. */
	offset(fallback = 6): number {
		const own = this.placement.gap;
		return Math.abs(typeof own === 'number' ? own : fallback);
	}

	/**
	 * Where a label reading `text` sits around its point: anchored `at` that
	 * offset from it (its `dx`/`dy`), on `side` of that anchor per axis - the
	 * way its `textAnchor`/`lineAnchor` set it - with the plot `edges` the
	 * point can sit on.
	 */
	edgeBox(
		text: string,
		side: BoxAnchors,
		at: { x?: number; y?: number },
		edges: MarginSide[]
	): EdgeBox {
		const box = this.textBox(text).beside({ x: at.x ?? 0, y: at.y ?? 0 }, side);
		return { box, edges };
	}

	/**
	 * Each series' value farthest from zero, read on `valueAxis` - the widest label it can show. With `'both'`,
	 * the farthest above zero and the farthest below it, whichever the series has.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	extremes<S extends Series<any>>(
		series: S[],
		valueAxis: 'x' | 'y' = 'y',
		sides: 'farthest' | 'both' = 'farthest'
	): { series: S; value: number }[] {
		return series.flatMap((s) => {
			const accessor = s[valueAxis];
			if (accessor === undefined) return [];
			const y = resolveAccessor(accessor);
			let extreme: number | undefined;
			let lowest: number | undefined;
			let highest: number | undefined;
			for (const d of s.data) {
				const v = Number(y(d));
				if (Number.isNaN(v)) continue;
				if (extreme === undefined || Math.abs(v) > Math.abs(extreme)) extreme = v;
				if (v < 0 && (lowest === undefined || v < lowest)) lowest = v;
				if (v >= 0 && (highest === undefined || v > highest)) highest = v;
			}
			if (extreme === undefined) return [];
			if (sides === 'farthest') return [{ series: s, value: extreme }];
			return [lowest, highest].flatMap((value) =>
				value === undefined ? [] : [{ series: s, value }]
			);
		});
	}

	/**
	 * What every label marker shares: the plot's margins grow to fit it, it
	 * dims with its row's series, and with `hoverIsolate`, hovering it
	 * isolates that series. A row without a series gets the margins only.
	 */
	hooks(
		env: AxisPlotEnv
	): Pick<TextMarkerConfig, 'fitMargins' | 'onpointerenter' | 'onpointerleave' | 'styles'> {
		const interaction = env.interaction;
		const seriesOf = (d: ProcessedRow) =>
			d?.[SERIES_KEY] === undefined ? undefined : String(d[SERIES_KEY]);
		const isolate = this.hoverIsolate && interaction;
		return {
			fitMargins: true,
			styles: {
				fillOpacity: (d: ProcessedRow) => {
					const series = seriesOf(d);
					return series === undefined ? 1 : (interaction?.fillFor(series)?.fillOpacity ?? 1);
				}
			},
			onpointerenter: isolate
				? (_event: Event, d: ProcessedRow) => interaction.isolate(seriesOf(d) ?? null)
				: undefined,
			onpointerleave: isolate ? () => interaction.isolate(null) : undefined
		};
	}

	/**
	 * A processed row's own value, read through its series' own value channel
	 * (`y`, or `x` on a horizontal plot) - what a label shows, even where a
	 * transform moved the row (a stacked row's top is the running total, not
	 * its own value).
	 */
	static valueOf<TData extends Record<string, unknown>>(state: {
		resolvedSeries?: Series<TData>[];
		axes?: PlotAxes;
	}): (d: ProcessedRow) => unknown {
		const valueAxis = PlotAxes.valueOf(state);
		const bySeries = new Map(
			(state.resolvedSeries ?? []).flatMap((s) => {
				const accessor = s[valueAxis];
				return accessor === undefined ? [] : [[seriesIdOf(s), resolveAccessor(accessor as never)]];
			})
		);
		return (d) => bySeries.get(String(d[SERIES_ID_KEY]))?.(d as never);
	}

	/**
	 * A series-over-`x` plot's (line, area) labels, for its line or area markers: each labelled row (by default its
	 * series' last) with its own value, on the `side` of it its placement asks, colored by the segment it falls in.
	 * Labels that would overlap fan out into a shared column. A plot that labels each end of its series apart passes
	 * the `rows` and `side` of one end, and `lane` to route them out to a lane whether or not they overlap.
	 */
	atSeriesEnds<TData extends Record<string, unknown>>(
		state: AxisPlotState<TData, object>,
		env: AxisPlotEnv,
		end: {
			rows?: ProcessedRow[];
			side?: PointSide;
			lane?: boolean | { elbowGap: number };
			flip?: boolean;
		} = {}
	): PointLabelConfig[] {
		if (end.rows) return this.#seriesEnds(state, env, end);
		// A label on a series' first point would sit on its own line: it goes out to a lane instead.
		const firsts = ValueLabels.#firstRows(state);
		const labelled = state.labelled ?? [];
		return [
			...this.#seriesEnds(state, env, { rows: labelled.filter((row) => !firsts.has(row)) }),
			...this.#seriesEnds(state, env, {
				rows: labelled.filter((row) => firsts.has(row)),
				lane: { elbowGap: ValueLabels.FIRST_LANE_GAP }
			})
		];
	}

	/**
	 * The labels of a plot whose rows have several values (a box's quartiles, a bullet's target): one `text` marker per
	 * part labelled, each of `rows` written at that part's value in its context - one label per value, for a part
	 * holding several (a box's outliers). `at` places a label at a value: its point, and the shape around it its
	 * `anchor` reads.
	 */
	partMarkers(
		env: AxisPlotEnv,
		rows: readonly ProcessedRow[],
		at: (value: symbol) => PointGeometryOf,
		defaults: {
			seriesColor?: (row: ProcessedRow) => string | undefined;
			/** The parts the kind writes on its own shapes, left out here: a bar's `value`. */
			skip?: string[];
		} = {}
	): TextMarkerConfig[] {
		const { styles: shared, ...hooks } = this.hooks(env);
		const { font } = this;
		// `series` labels the rows of those series only.
		const named = this.series && new Set(this.series);
		const labelled = named ? rows.filter((row) => named.has(String(row[SERIES_KEY]))) : rows;
		return this.parts.flatMap((part) => {
			if (defaults.skip?.includes(part.name)) return [];
			const placed = labelled.flatMap((row) => {
				const own = (RowContext.of(row) as Record<string, unknown>)[part.name];
				return (Array.isArray(own) ? own : [own])
					.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
					.map((value) => ({ ...row, [PART_VALUE]: value }));
			});
			const label = {
				...hooks,
				...part.placement,
				layout: 'point',
				text: (row: ProcessedRow) =>
					part.format(Number(row[PART_VALUE]), row, undefined, part.name),
				styles: {
					...shared,
					...font,
					fill:
						this.fill ??
						(this.color === 'series' ? defaults.seriesColor : undefined) ??
						'currentColor',
					fontSize: font?.fontSize ?? 11
				}
			} as PointLabelConfig;
			const marker =
				placed.length > 0 &&
				PointLayout.build(label, at(PART_VALUE), placed, { gap: this.#cfg.text.label.gap });
			return marker ? [marker] : [];
		});
	}

	/**
	 * Where a part label of a row sits on a plot of categories: at the row's `category` (a field or a function of
	 * it), level with the part's value, across the category's band - which an `anchor` reads, to write it beside.
	 */
	static bandPoint(
		state: { axes?: PlotAxes },
		category: unknown,
		/** How wide the shape is across its band, in pixels, when it does not fill it: a violin's inner box. */
		across?: number,
		/** A row's slot of its band, when its series share it side by side. */
		slot?: (row: ProcessedRow) => { index: number; count: number } | undefined
	): (value: symbol) => PointGeometryOf {
		const valueAxis = PlotAxes.valueOf(state);
		const categoryAxis = PlotAxes.categoryOf(state);
		return (value) =>
			({
				[categoryAxis]: category,
				[valueAxis]: value,
				shift:
					slot &&
					((row: unknown, scales: BoxScales) => {
						const own = slot(row as ProcessedRow);
						const band = Number(scales[categoryAxis]?.fn?.bandwidth?.() ?? 0);
						if (!own || !band) return undefined;
						const share = band / own.count;
						const offset = share * own.index + share / 2 - band / 2;
						return categoryAxis === 'x' ? { dx: offset, dy: 0 } : { dx: 0, dy: offset };
					}),
				size: (_row: unknown, scales: BoxScales) => {
					const band = across ?? Number(scales[categoryAxis]?.fn?.bandwidth?.() ?? 0);
					return categoryAxis === 'x' ? { width: band, height: 0 } : { width: 0, height: band };
				}
			}) as unknown as PointGeometryOf;
	}

	/** The placement that writes each of `parts` beside its category's band: to its right, or above sideways bands. */
	static besideBand(
		state: { axes?: PlotAxes },
		parts: string[]
	): Record<string, Record<string, unknown>> {
		const beside = { anchor: state.axes?.isHorizontal ? 'top' : 'right' };
		return Object.fromEntries(parts.map((part) => [part, beside]));
	}

	/** A series-over-`x` plot's labels in its {@link layout}: at its series' ends, or along its lines. */
	forSeries<TData extends Record<string, unknown>>(
		state: AxisPlotState<TData, object>,
		env: AxisPlotEnv
	): MarkerLabelConfig[] {
		return this.layout === 'path' ? this.alongSeries(state, env) : this.atSeriesEnds(state, env);
	}

	/** The side of its point a `'point'` label is written on: its placement's, else after it. */
	get side(): PointSide {
		return (this.placement.side as PointSide | undefined) ?? 'after';
	}

	/**
	 * A series-over-`x` plot's `'path'` labels, for its line or area markers: each series' name - or, with a `format`,
	 * the text it writes for the series' first row - along its line, colored by the series.
	 */
	alongSeries<TData extends Record<string, unknown>>(
		state: AxisPlotState<TData, object>,
		env: AxisPlotEnv
	): MarkerLabelConfig[] {
		const { font } = this;
		const nameOf = (d: ProcessedRow) => String(d[SERIES_KEY]);
		const { styles: shared, ...hooks } = this.hooks(env);
		return [
			{
				...hooks,
				...this.placement,
				layout: 'path',
				text: (d: ProcessedRow) => (this.formatted ? this.text(d) : nameOf(d)),
				styles: {
					...shared,
					...font,
					fill: this.fill ?? ((d: ProcessedRow) => this.#colorOf(state, d) ?? 'currentColor'),
					fontSize: font?.fontSize ?? 12
				}
			} as MarkerLabelConfig
		];
	}

	/** A series row's color: the segment it falls in, else its series'. */
	#colorOf<TData extends Record<string, unknown>>(
		state: AxisPlotState<TData, object>,
		d: ProcessedRow
	): string | undefined {
		const id = String(d[SERIES_ID_KEY]);
		const group = state.scopedGroups?.find((g) => (g.id ?? g.name) === id);
		const segment = group?.segments.find((seg) => seg.match(d as TData));
		return (
			segment?.color ??
			group?.segments[0]?.color ??
			group?.color ??
			state.colorForSeries?.(String(d[SERIES_KEY]))
		);
	}

	/** `markers` with `labels` on each one of `type`: the shapes of a series carry its labels. */
	static onMarkers<T extends { type: string }>(
		markers: T[],
		type: string,
		labels: MarkerLabelConfig[] | undefined
	): T[] {
		if (!labels?.length) return markers;
		return markers.map((marker) => (marker.type === type ? { ...marker, label: labels } : marker));
	}

	/** How far (px) a lane takes the label of a series' first point from it - clear of the line that leaves it. */
	static readonly FIRST_LANE_GAP = 28;

	/** The first row of every series that has more than one. */
	static #firstRows(state: { processedData?: ProcessedData }): Set<ProcessedRow> {
		const first = new Map<string, ProcessedRow>();
		const counts = new Map<string, number>();
		for (const row of state.processedData?.data ?? []) {
			const id = String(row[SERIES_ID_KEY]);
			if (!first.has(id)) first.set(id, row);
			counts.set(id, (counts.get(id) ?? 0) + 1);
		}
		return new Set([...first].filter(([id]) => (counts.get(id) ?? 0) > 1).map(([, row]) => row));
	}

	#seriesEnds<TData extends Record<string, unknown>>(
		state: AxisPlotState<TData, object>,
		env: AxisPlotEnv,
		end: {
			rows?: ProcessedRow[];
			side?: PointSide;
			lane?: boolean | { elbowGap: number };
			flip?: boolean;
		}
	): PointLabelConfig[] {
		const rows = new Set(end.rows ?? state.labelled ?? []);
		if (rows.size === 0) return [];
		const { font } = this;
		const side = end.side ?? this.side;
		const at = PointLayout.sideOf(side, this.placement.gap as number | undefined);
		const { styles: shared, ...hooks } = this.hooks(env);
		return [
			{
				...hooks,
				layout: 'point',
				select: (row: ProcessedRow) => rows.has(row),
				grouping: SERIES_ID_KEY,
				text: (d: ProcessedRow) => this.text(d),
				styles: {
					...shared,
					...font,
					fill: this.fill ?? ((d: ProcessedRow) => this.#colorOf(state, d) ?? 'currentColor'),
					fontSize: font?.fontSize ?? 12,
					dx: at.dx,
					dy: at.dy,
					textAnchor: at.textAnchor,
					lineAnchor: at.lineAnchor
				},
				declutter: {
					connector: this.strokeStyle,
					aligned: !!end.lane && (side === 'after' || side === 'before'),
					elbowGap: typeof end.lane === 'object' ? end.lane.elbowGap : undefined,
					flip: end.flip
				}
			} as PointLabelConfig
		];
	}

	/** The rows of a series-over-`x` plot that cannot be labelled: a gap, or a stack with no top. For the "transforms" phase's `labels.skip`. */
	static skipGaps<TData extends Record<string, unknown>>(state: {
		processedData?: ProcessedData;
		resolvedSeries?: Series<TData>[];
		axes?: PlotAxes;
	}): (row: ProcessedRow) => boolean {
		const valueOf = ValueLabels.valueOf(state);
		const top = ProcessedPositions.of(state.processedData!).y;
		return (row) => isGapValue(valueOf(row)) || isGapValue(top(row));
	}

	/**
	 * Where {@link atSeriesEnds}' labels are expected to sit: past each
	 * series' last point, at the right edge (or the left, for labels set
	 * before their point; both for a fan of several series, which can flip),
	 * reaching up or down from the top or bottom edge. Read off the `y`
	 * domain when the scales set one, so it holds across a timeline; else off
	 * every value.
	 */
	reachAtSeriesEnds<TData extends Record<string, unknown>>(
		state: AxisPlotState<TData, object>,
		pointSide: PointSide = this.side
	): EdgeBox[] {
		const series = state.resolvedSeries ?? [];
		const { format } = this;
		const written = PointLayout.sideOf(pointSide, this.placement.gap as number | undefined);
		const { dx, dy, textAnchor, lineAnchor } = written;
		const side: BoxAnchors = {
			x: textAnchor === 'start' ? 'after' : textAnchor === 'end' ? 'before' : 'middle',
			y: lineAnchor === 'top' ? 'after' : lineAnchor === 'bottom' ? 'before' : 'middle'
		};
		// Labels that would overlap fan out into lanes, each one further out.
		const { elbowGap, laneStep, labelGap } = this.declutter;
		const lanes = elbowGap + (series.length - 1) * laneStep + labelGap;
		const at = { x: series.length > 1 ? (Math.sign(dx) || 1) * lanes : dx, y: dy };
		// Only a label that can sit at the plot's right end - any but a first point's - reaches that edge.
		const selects = state.labelSelects ?? [];
		const atRight = selects.length === 0 || selects.some((select) => select !== 'first');
		// Likewise a label set before its point reaches the left edge only from a point that can sit there: any but a last one - or a last one that is also the first, of a series with a single point.
		const atLeft =
			selects.length === 0 ||
			selects.some((select) => select !== 'last') ||
			series.some((s) => s.data.length < 2);
		const edges: MarginSide[] = [
			'top',
			'bottom',
			...(dx < 0 && atLeft ? (['left'] as const) : []),
			...((dx >= 0 || series.length > 1) && atRight ? (['right'] as const) : [])
		];

		const texts: string[] = [];
		const domain = state.scales.y?.domain;
		if (domain && domain.length >= 2) {
			const lo = Number(domain[0]);
			const hi = Number(domain[domain.length - 1]);
			for (const s of series)
				texts.push(format(lo, undefined, s.name), format(hi, undefined, s.name));
		} else {
			for (const s of series) {
				if (s.y === undefined) continue;
				const y = resolveAccessor(s.y);
				for (const d of s.data) {
					const v = Number(y(d));
					if (!Number.isNaN(v)) texts.push(format(v, undefined, s.name));
				}
			}
		}
		// +2px: canvas and SVG text can measure a pixel or so apart.
		return texts.map((text) => {
			const { box } = this.edgeBox(text, side, at, edges);
			return { box: box.pad(2), edges };
		});
	}
}
