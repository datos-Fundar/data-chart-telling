import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { Box } from '$lib/layout/margins/Box';
import { resolveAccessor } from '$lib/utils/accessors';
import { SERIES_ID_KEY, SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { seriesIdOf } from '$lib/utils/grouping';
import { Transforms } from '$lib/phases/transforms/Transforms';
import { isGapValue } from '$lib/plots/utils/gaps';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { ValuesStyle } from '$lib/types/layout/styles';
import type { ValueLabelsOptions } from '$lib/types/phases/styles/phase';
import type { Series } from '$lib/types/plots/data/common';
import type { FontStyle, StrokeStyle } from '$lib/types/plots/styling';
import type { TextAnchor, ValueAnchor } from '$lib/types/plots/constants';
import type { BoxAnchors, EdgeBox } from '$lib/types/layout/box';
import type { MarginSide } from '$lib/types/plots/props';
import type { AxisPlotCtx, AxisPlotState, ProcessedRow } from '$lib/types/phases';
import type { TextMarkerConfig } from '$lib/types/markers/common';

/**
 * A plot's value labels: the author's `styles.values` over the plot kind's
 * own defaults, how their text measures, where they are expected to sit
 * (`reach`, which the plot's margins keep room for), and what every label marker shares
 * ({@link hooks}). The "markers" phase draws them.
 */
export class ValueLabels {
	readonly show: boolean;
	readonly anchor: ValueAnchor;
	readonly format: (value: number, seriesName: string) => string;
	readonly hoverIsolate: boolean;
	readonly font: FontStyle | undefined;
	readonly fontSize: number;
	/** The connectors of labels that had to move apart. */
	readonly strokeStyle: StrokeStyle | undefined;
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
		this.format = values?.format ?? options.format ?? ((v: number) => `${v}`);
		this.hoverIsolate = values?.hoverIsolate ?? false;
		this.font = values?.fontStyle;
		this.fontSize = typeof this.font?.fontSize === 'number' ? this.font.fontSize : 12;
		this.strokeStyle = values?.strokeStyle;
		this.declutter = cfg.text.declutter;
		this.#cfg = cfg;
		this.reach = (this.show && reach?.(this)) || [];
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

	/** Each series' value farthest from zero, read on `valueAxis` - the widest label it can show. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	extremes<S extends Series<any>>(
		series: S[],
		valueAxis: 'x' | 'y' = 'y'
	): { series: S; value: number }[] {
		return series.flatMap((s) => {
			const accessor = s[valueAxis];
			if (accessor === undefined) return [];
			const y = resolveAccessor(accessor);
			let extreme: number | undefined;
			for (const d of s.data) {
				const v = Number(y(d));
				if (!Number.isNaN(v) && (extreme === undefined || Math.abs(v) > Math.abs(extreme)))
					extreme = v;
			}
			return extreme === undefined ? [] : [{ series: s, value: extreme }];
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
		ctx: AxisPlotCtx
	): Pick<TextMarkerConfig, 'fillOpacity' | 'fitMargins' | 'onPointerEnter' | 'onPointerLeave'> {
		const interaction = ctx.interaction;
		const seriesOf = (d: ProcessedRow) =>
			d?.[SERIES_KEY] === undefined ? undefined : String(d[SERIES_KEY]);
		const isolate = this.hoverIsolate && interaction;
		return {
			fitMargins: true,
			fillOpacity: (d: ProcessedRow) => {
				const series = seriesOf(d);
				return series === undefined ? undefined : interaction?.fillFor(series)?.fillOpacity;
			},
			onPointerEnter: isolate
				? (d: ProcessedRow) => interaction.isolate(seriesOf(d) ?? null)
				: undefined,
			onPointerLeave: isolate ? () => interaction.isolate(null) : undefined
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
	 * A series-over-`x` plot's (line, area) labels: one `'text'` marker over
	 * the processed rows, each visible series' last row with a value
	 * (`filter` + `selectLast`, per series), at its top (a stacked row's
	 * `y2`), labelled with its own value and placed by `anchor`. Labels that
	 * would overlap fan out into a shared column (`declutter`), colored by the
	 * segment the row falls in.
	 */
	atSeriesEnds<TData extends Record<string, unknown>>(
		state: AxisPlotState<TData, object>
	): TextMarkerConfig[] {
		const processed = state.processedData;
		if (!processed) return [];
		const { font, anchor, format } = this;
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
		const marker = Transforms.resolve<TextMarkerConfig>(
			{
				type: 'text',
				data: processed.data,
				x: (processed.channels.x ?? position.x) as TextMarkerConfig['x'],
				y: (processed.channels.y2 ?? processed.channels.y ?? topOf) as TextMarkerConfig['y'],
				grouping: SERIES_ID_KEY,
				transforms: [
					{
						type: 'filter',
						filter: (d: ProcessedRow) => !isGapValue(valueOf(d)) && !isGapValue(topOf(d))
					},
					{ type: 'selectLast' }
				],
				text: (d: ProcessedRow) => format(Number(valueOf(d)), nameOf(d)),
				styles: {
					...font,
					fontSize: font?.fontSize ?? 12,
					dx: font?.dx ?? (anchor === 'start' ? 6 : anchor === 'end' ? -6 : 0),
					dy: font?.dy ?? (anchor === 'outside' ? -8 : 0),
					textAnchor:
						this.textAnchor ?? (anchor === 'start' || anchor === 'end' ? anchor : 'middle'),
					lineAnchor: font?.lineAnchor ?? (anchor === 'outside' ? 'bottom' : 'middle')
				},
				fill: font?.fill ? undefined : colorOf,
				declutter: { connector: this.strokeStyle }
			},
			processed.data
		);
		return marker.data?.length ? [marker] : [];
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
		state: AxisPlotState<TData, object>
	): EdgeBox[] {
		const series = state.resolvedSeries ?? [];
		const { anchor, font, format } = this;
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
		const edges: MarginSide[] = [
			'top',
			'bottom',
			...(dx < 0 ? (['left'] as const) : []),
			...(dx >= 0 || series.length > 1 ? (['right'] as const) : [])
		];

		const texts: string[] = [];
		const domain = state.scales.y?.domain;
		if (domain && domain.length >= 2) {
			const lo = Number(domain[0]);
			const hi = Number(domain[domain.length - 1]);
			for (const s of series) texts.push(format(lo, s.name), format(hi, s.name));
		} else {
			for (const s of series) {
				if (s.y === undefined) continue;
				const y = resolveAccessor(s.y);
				for (const d of s.data) {
					const v = Number(y(d));
					if (!Number.isNaN(v)) texts.push(format(v, s.name));
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
