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
import type { ValuesStyle } from '$lib/types/layout/styles';
import type { ValueLabelsOptions } from '$lib/types/phases/styles/phase';
import type { Series } from '$lib/types/plots/data/common';
import type { FontStyle, StrokeStyle } from '$lib/types/plots/styling';
import type { LabelAnchor, TextAnchor, ValueAnchor } from '$lib/types/plots/constants';
import type { BoxAnchors, EdgeBox } from '$lib/types/layout/box';
import type { MarginSide } from '$lib/types/plots/props';
import type { AxisPlotEnv, AxisPlotState, ProcessedData, ProcessedRow } from '$lib/types/phases';
import type { TextMarkerConfig } from '$lib/types/markers/common';
import type { BoxLabelConfig } from '$lib/types/markers/labels/box';

/**
 * A plot's value labels: the author's `styles.values` over the plot kind's
 * own defaults, how their text measures, where they are expected to sit
 * (`reach`, which the plot's margins keep room for), and what every label marker shares
 * ({@link hooks}). The "markers" phase draws them.
 */
export class ValueLabels {
	readonly show: boolean;
	readonly anchor: ValueAnchor;
	/**
	 * A label's text for `value`: the author's `format`, else the kind's, else the value as the display fields ask.
	 * `row` is the row it labels, whose context the format reads; `series` names its series where there is no row
	 * (a label measured ahead of the rows).
	 */
	readonly format: (value: number, row?: object, series?: string) => string;
	readonly hoverIsolate: boolean;
	readonly font: FontStyle | undefined;
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
		options: Omit<ValueLabelsOptions<never>, 'reach'> = {},
		reach?: (labels: ValueLabels) => EdgeBox[]
	) {
		this.show = values?.show ?? options.show ?? false;
		this.anchor = values?.anchor ?? options.anchor ?? 'outside';
		// The value as the display fields ask (else as it is), which a plot kind's own text builds on.
		const number =
			NumberFormat.maybe(NumberFormat.displayOf(values), cfg) ?? ((v: number) => `${v}`);
		const own = values?.format ?? options.format;
		this.format = own
			? (v, row, series) => own(v, number, ValueLabels.contextOf(row, series))
			: (v) => number(v);
		this.hoverIsolate = values?.hoverIsolate ?? false;
		this.font = values?.fontStyle;
		this.fontSize = typeof this.font?.fontSize === 'number' ? this.font.fontSize : 12;
		this.strokeStyle = values?.strokeStyle;
		this.color = values?.color;
		this.declutter = cfg.text.declutter;
		this.#cfg = cfg;
		this.reach = (this.show && reach?.(this)) || [];
	}

	/** The context a label's `format` reads: its row's, with `series` when the row gives none. */
	static contextOf(row: object | undefined, series?: string): PlotRowContext {
		const context = RowContext.of(row);
		return context.series === undefined && series !== undefined ? { ...context, series } : context;
	}

	/** A plot's value labels: `values` over `options`, the kind's own defaults, their reach read off `state`. */
	static build<TState>(
		values: ValuesStyle | undefined,
		cfg: PlotStylesConfig,
		options: ValueLabelsOptions<TState>,
		state: TState
	): ValueLabels {
		const { reach } = options;
		return new ValueLabels(values, cfg, options, reach && ((labels) => reach(labels, state)));
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

	/** The labels' gap (px) from their mark along `axis`: their own `dx`/`dy`, else `fallback`. */
	offset(axis: 'x' | 'y', fallback = 6): number {
		const own = axis === 'x' ? this.font?.dx : this.font?.dy;
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
	 * The author's own `textAnchor`, if any. `'outside'` is a hover marker's
	 * per-point anchor; a label's own `anchor` already places it, so here it
	 * counts as unset.
	 */
	get textAnchor(): Exclude<TextAnchor, 'outside'> | undefined {
		const own = this.font?.textAnchor;
		return own === 'outside' ? undefined : own;
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
	 * Where in a bar a label goes, from the `anchor` of `styles.values`: its `label` anchor, and whether it is beyond
	 * the bar. `negative` tells a bar that runs to the left (or down) from its base from one that runs right (or up),
	 * which `'tip'`, `'base'` and `'outside'` follow; the others are the edges of the page. A `stacked` bar's label is
	 * always in the middle. An anchor the shapes do not read (`'start'`, `'end'`) is taken for `'outside'`, the default.
	 */
	static boxAnchor(
		anchor: ValueAnchor,
		shape: { isHorizontal: boolean; negative?: boolean; stacked?: boolean }
	): { anchor: LabelAnchor; outside?: boolean } {
		if (shape.stacked || anchor === 'middle') return { anchor: 'middle' };
		// A place in the shape as it is drawn on the page, which no sign moves.
		if (
			anchor !== 'outside' &&
			anchor !== 'start' &&
			anchor !== 'end' &&
			anchor !== 'tip' &&
			anchor !== 'base'
		) {
			return { anchor };
		}
		const [tip, base] = shape.isHorizontal
			? shape.negative
				? (['left', 'right'] as const)
				: (['right', 'left'] as const)
			: shape.negative
				? (['bottom', 'top'] as const)
				: (['top', 'bottom'] as const);
		if (anchor === 'base') return { anchor: base };
		return anchor === 'tip' ? { anchor: tip } : { anchor: tip, outside: true };
	}

	/** Whether a label at `anchor` goes to one side or the other of a bar with the sign of its value. */
	static followsSign(anchor: ValueAnchor): boolean {
		return anchor === 'outside' || anchor === 'tip' || anchor === 'base';
	}

	/**
	 * The `label` the shapes of a plot kind write their value in: this plot's `styles.values` over the `defaults` the kind
	 * sets, with what every label shares ({@link hooks}) - its dimming and isolating of a series. A label inside its shape
	 * never reaches out of the plot, so only one `outside` has the margins grow to hold it; and it takes the default
	 * `fill` only `outside`, for inside it is written in the color that contrasts with its shape.
	 */
	shapeLabel(
		env: AxisPlotEnv,
		text: (row: ProcessedRow) => string,
		defaults: {
			fill?: string;
			fontSize?: number;
			fontWeight?: FontStyle['fontWeight'];
			anchor?: LabelAnchor;
			outside?: boolean;
			gap?: number;
		} = {}
	): BoxLabelConfig {
		const { fitMargins, styles: shared, ...events } = this.hooks(env);
		const { font } = this;
		return {
			...events,
			text,
			anchor: defaults.anchor,
			outside: defaults.outside,
			gap: defaults.gap,
			fitMargins: defaults.outside ? fitMargins : undefined,
			styles: {
				...shared,
				...font,
				// Inside its shape, a label unset is written in the color that reads best on it.
				fill: font?.fill ?? (defaults.outside ? defaults.fill : undefined),
				fontSize: font?.fontSize ?? defaults.fontSize ?? 12,
				fontWeight: font?.fontWeight ?? defaults.fontWeight
			}
		} as BoxLabelConfig;
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
	 * A series-over-`x` plot's (line, area) labels: one `'text'` marker over
	 * the processed rows, each visible series' last row with a value
	 * (`filter` + `selectLast`, per series), at its top (a stacked row's
	 * `y2`), labelled with its own value and placed by `anchor`. Labels that
	 * would overlap fan out into a shared column (`declutter`), colored by the
	 * segment the row falls in. A plot that labels each end of its series apart
	 * passes the `rows` and `anchor` of one end, and `lane` to route its labels
	 * out to a lane whether or not they overlap (`flip: false` keeps one on the
	 * left in the margin instead of flipping it over its points).
	 */
	atSeriesEnds<TData extends Record<string, unknown>>(
		state: AxisPlotState<TData, object>,
		end: {
			rows?: ProcessedRow[];
			anchor?: ValueAnchor;
			lane?: boolean | { elbowGap: number };
			flip?: boolean;
		} = {}
	): TextMarkerConfig[] {
		if (end.rows) return this.#seriesEnds(state, end);
		// A label on a series' first point would sit on its own line: it goes out to a lane instead.
		const firsts = ValueLabels.#firstRows(state);
		const labelled = state.labelled ?? [];
		return [
			...this.#seriesEnds(state, { rows: labelled.filter((row) => !firsts.has(row)) }),
			...this.#seriesEnds(state, {
				rows: labelled.filter((row) => firsts.has(row)),
				lane: { elbowGap: ValueLabels.FIRST_LANE_GAP }
			})
		];
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
		end: {
			rows?: ProcessedRow[];
			anchor?: ValueAnchor;
			lane?: boolean | { elbowGap: number };
			flip?: boolean;
		}
	): TextMarkerConfig[] {
		const processed = state.processedData;
		if (!processed) return [];
		const { font, format } = this;
		const anchor = end.anchor ?? this.anchor;
		const position = ProcessedPositions.of(processed);
		const topOf = (d: ProcessedRow) => position.y(d);
		const nameOf = (d: ProcessedRow) => String(d[SERIES_KEY]);
		const valueOf = ValueLabels.valueOf(state);
		const colorOf = (d: ProcessedRow) => {
			const id = String(d[SERIES_ID_KEY]);
			const group = state.scopedGroups?.find((g) => (g.id ?? g.name) === id);
			const segment = group?.segments.find((seg) => seg.match(d as TData));
			return (
				segment?.color ??
				group?.segments[0]?.color ??
				group?.color ??
				state.colorForSeries?.(nameOf(d))
			);
		};
		const marker: TextMarkerConfig = {
			type: 'text',
			// The rows the "transforms" phase picked for the labels: by default each series' last.
			data: end.rows ?? state.labelled ?? [],
			x: (processed.channels.x ?? position.x) as TextMarkerConfig['x'],
			y: (processed.channels.y2 ?? processed.channels.y ?? topOf) as TextMarkerConfig['y'],
			grouping: SERIES_ID_KEY,
			text: (d: ProcessedRow) => format(Number(valueOf(d)), d, nameOf(d)),
			styles: {
				...font,
				fill: this.fill ?? ((d: ProcessedRow) => colorOf(d) ?? 'currentColor'),
				fontSize: font?.fontSize ?? 12,
				dx: font?.dx ?? (anchor === 'start' ? 6 : anchor === 'end' ? -6 : 0),
				dy: font?.dy ?? (anchor === 'outside' ? -8 : 0),
				textAnchor: this.textAnchor ?? (anchor === 'start' || anchor === 'end' ? anchor : 'middle'),
				lineAnchor: font?.lineAnchor ?? (anchor === 'outside' ? 'bottom' : 'middle')
			},
			declutter: {
				connector: this.strokeStyle,
				aligned: !!end.lane && (anchor === 'start' || anchor === 'end'),
				elbowGap: typeof end.lane === 'object' ? end.lane.elbowGap : undefined,
				flip: end.flip
			}
		};
		return marker.data?.length ? [marker] : [];
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
		anchor: ValueAnchor = this.anchor
	): EdgeBox[] {
		const series = state.resolvedSeries ?? [];
		const { font, format } = this;
		const dx =
			typeof font?.dx === 'number' ? font.dx : anchor === 'start' ? 6 : anchor === 'end' ? -6 : 0;
		const dy = typeof font?.dy === 'number' ? font.dy : anchor === 'outside' ? -8 : 0;
		const textAnchor =
			this.textAnchor ?? (anchor === 'start' ? 'start' : anchor === 'end' ? 'end' : 'middle');
		const lineAnchor = font?.lineAnchor ?? (anchor === 'outside' ? 'bottom' : 'middle');
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
