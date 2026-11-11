import { isGapValue } from '$lib/plots/utils/gaps';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import { ClevelandRanges } from '$lib/plots/ranking/cleveland/ClevelandRanges';
import { ClevelandConnector } from '$lib/plots/ranking/cleveland/ClevelandConnector';
import { BasicStyles } from '$lib/layout/styles/BasicStyles';
import type {
	ClevelandPlotState,
	ClevelandPlotEnv,
	ClevelandOptions,
	ClevelandEntry,
	ClevelandRole
} from '$lib/types/plots/ranking/cleveland/state';
import type {
	AxisBasedMarkersConfig,
	ArrowMarkerConfig,
	DotMarkerConfig,
	RuleMarkerConfig,
	TextMarkerConfig,
	TickMarkerConfig
} from '$lib/types/markers/common';
import type { PointLabelConfig, PointSide } from '$lib/types/markers/labels/point';
import type { MarkerLabelConfig } from '$lib/types/markers/labels/common';
import { PointLayout } from '$lib/markers/labels/layouts/PointLayout';
import type { ProcessedRow } from '$lib/types/phases';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { StrokeStyle } from '$lib/types/plots/styling';
import type { BasicStylesConfig, ConnectorRange } from '$lib/types/layout/styles';
import type { TextAnchor, LineAnchor } from '$lib/types/plots/constants';
import type { EdgeBox } from '$lib/types/layout/box';

/** Where a label sits from its dot, and how its text anchors there. */
type Place = { dx: number; dy: number; textAnchor: TextAnchor; lineAnchor: LineAnchor };
type Channel = Exclude<RuleMarkerConfig['value'], unknown[]>;
type ValueChannel = RuleMarkerConfig['x2'];

/** The messages already warned about, so a plot that redraws warns once. */
const warned = new Set<string>();

/**
 * The marks of the Cleveland family of plots, which differ only by their
 * {@link ClevelandOptions}: per category, a connector from its lowest to its
 * highest value (from the baseline, for a lollipop) with a dot at each value.
 * A category with one dot gets a stem in that dot's series color, restyled by
 * the segment its dot belongs to; a category with several gets one neutral
 * connector. The "markers" phase takes its `marks` and `reach`.
 */
export class ClevelandMarkers {
	readonly #options: ClevelandOptions;

	constructor(options: ClevelandOptions) {
		this.#options = options;
	}

	/** Forgets what was warned about; for tests. */
	static resetWarnings(): void {
		warned.clear();
	}

	/** The plot's connectors, then its dots, which draw on top of them. */
	marks = <TData extends Record<string, unknown>>(
		state: ClevelandPlotState<TData>,
		env: ClevelandPlotEnv
	): AxisBasedMarkersConfig[] => {
		const { cfg, interaction } = env;
		const style = cfg[this.#options.config];
		const { isHorizontal } = ClevelandMarkers.#geometry(state);
		const ranges = ClevelandRanges.of(
			state,
			this.#options.fromBaseline ?? false,
			ClevelandConnector.ends(state),
			this.#options.interval ?? false
		);
		this.#validate(ranges);

		const connector = ClevelandConnector.of(state, cfg.connector, ranges.entries);
		const groups = state.processedGroups ?? [];
		const segmentOf = new Map<ProcessedRow, { series: string; styles: LineSegmentStyle }>();
		for (const group of groups) {
			for (const segment of group.visualSegments) {
				for (const row of segment.data) {
					segmentOf.set(row, { series: group.series.name, styles: segment.styles });
				}
			}
		}

		// Each category's connector: a row of its own look. A lone dot's stem takes its series'
		// color and its segment's style; the legend dims it with the series.
		const size = state.channels?.r;
		const dotRadius = typeof size === 'number' ? size : style.dotRadius;
		const neutral = style.connectorColor ?? 'currentColor';
		// `styles.stroke` is the connectors' look below everything the author sets for them: a segment's
		// stroke wins over `styles.connector`, which wins over it. A function of the series styles only
		// the connector of a lone dot, which has a series; the connector of several dots has none.
		const baseStroke = (state.styles as BasicStylesConfig | undefined)?.stroke;
		const looks = ranges.entries.map((entry) => {
			const range = connector.rangeOf(entry);
			const owner = range.series === undefined ? undefined : segmentOf.get(entry.dots[0].row);
			const stem = owner?.styles.stroke;
			const base = BasicStyles.read(baseStroke, range.series);
			const disabled = owner && interaction?.strokeFor(owner.series);
			const strokeWidth =
				disabled?.strokeWidth ??
				stem?.strokeWidth ??
				connector.width(range, dotRadius) ??
				base?.strokeWidth ??
				(style.stemWidth === 'dots' ? dotRadius * 2 : style.stemWidth);
			// The stretch between the `from` and `to` dots, in the connector's look...
			const [start, end] = range.span ?? [entry.from, entry.to];
			const category = entry.category;
			const span = {
				category,
				from: start,
				to: end,
				mid: (start + end) / 2,
				stroke:
					disabled?.stroke ??
					stem?.stroke ??
					connector.color(range) ??
					base?.stroke ??
					(owner ? state.colorForSeries!(owner.series) : neutral),
				strokeWidth,
				strokeOpacity:
					disabled?.strokeOpacity ??
					stem?.strokeOpacity ??
					connector.opacity(range) ??
					base?.strokeOpacity ??
					1
			};
			// ...as an arrow from one dot to the other, when the connector asks for one...
			const arrow = connector.arrow;
			const way =
				arrow && entry.change && entry.change[0] !== entry.change[1] ? entry.change : undefined;
			const drawn = way
				? {
						category,
						start: way[0],
						end: way[1],
						stroke: span.stroke,
						strokeWidth: connector.width(range, dotRadius) ?? arrow!.width,
						strokeOpacity: span.strokeOpacity
					}
				: undefined;
			// ...and what runs on past either end of it, to the other series' dots.
			const outside = connector.outside(neutral);
			const beyond = [
				[entry.from, start],
				[end, entry.to]
			]
				.filter(([from, to]) => to > from)
				.map(([from, to]) => ({
					category,
					from,
					to,
					mid: (from + to) / 2,
					...outside,
					strokeWidth
				}));
			return {
				range,
				row: span,
				// A stretch drawn as an arrow is not one of the lines.
				rows: drawn ? beyond : [span, ...beyond],
				arrow: drawn,
				// What a stroke draws all of a marker's rows alike with, which a marker takes once for them.
				pattern: ClevelandMarkers.#pattern(
					disabled?.strokeDasharray ?? stem?.strokeDasharray ?? base?.strokeDasharray,
					disabled?.strokeLinecap ?? stem?.strokeLinecap ?? base?.strokeLinecap,
					disabled?.strokeLinejoin ?? stem?.strokeLinejoin ?? base?.strokeLinejoin
				)
			};
		});
		// One rule marker per dash, cap and join pattern, which a marker takes once for all its rows.
		const byPattern = new Map<string, { pattern: StrokeStyle; looks: typeof looks }>();
		for (const look of looks) {
			const key = JSON.stringify(look.pattern);
			const group = byPattern.get(key) ?? { pattern: look.pattern, looks: [] };
			group.looks.push(look);
			byPattern.set(key, group);
		}
		const rules = [...byPattern.values()].map(
			({ pattern, looks: group }): RuleMarkerConfig => ({
				type: 'rule',
				// A connector is not what the series look like: its dots are.
				legend: false,
				axis: isHorizontal ? 'y' : 'x',
				data: group.flatMap((look) => look.rows),
				value: 'category',
				...(isHorizontal ? { x1: 'from', x2: 'to' } : { y1: 'from', y2: 'to' }),
				styles: {
					...pattern,
					stroke: 'stroke',
					strokeWidth: 'strokeWidth',
					strokeOpacity: 'strokeOpacity'
				}
			})
		);

		// The arrows, one marker per pattern like the lines, each from its `from` dot to its `to` dot.
		const head = connector.arrow;
		const arrows = [...byPattern.values()].flatMap(
			({ pattern, looks: group }): ArrowMarkerConfig[] => {
				const rows = group.flatMap((look) => (look.arrow ? [look.arrow] : []));
				if (rows.length === 0 || !head) return [];
				return [
					{
						type: 'arrow',
						legend: false,
						data: rows,
						...(isHorizontal
							? { x1: 'start', x2: 'end', y1: 'category', y2: 'category' }
							: { y1: 'start', y2: 'end', x1: 'category', x2: 'category' }),
						headLength: head.headLength,
						headAngle: head.headAngle,
						// The shaft starts and ends at the edge of its dots, not under them.
						styles: {
							...pattern,
							insetStart: dotRadius,
							insetEnd: dotRadius,
							stroke: 'stroke',
							strokeWidth: 'strokeWidth',
							strokeOpacity: 'strokeOpacity'
						}
					}
				];
			}
		);

		// Caps: a tick across each end of a connector, in its look - one marker per look, which a marker takes once for all its ticks.
		const capLength = connector.caps(style.caps);
		const caps =
			capLength === undefined ? [] : this.#caps(ranges.entries, looks, capLength, isHorizontal);

		const { category, value } = ClevelandMarkers.#channels(state);
		// A number is a literal pixel radius; a field or function sizes each dot by its row.
		const r = size === undefined || typeof size === 'number' ? size : size.accessor;
		const dots = groups.flatMap((group) => {
			const name = group.series.name;
			const color = state.colorForSeries!(name);
			const disabled = interaction?.dotsFor(name);
			return group.visualSegments.map((segment): DotMarkerConfig => {
				const stem = segment.styles.stroke;
				const dot = segment.styles.dot;
				return {
					type: 'dot',
					series: name,
					data: segment.data,
					hover: 'style',
					...(isHorizontal ? { x: value, y: category } : { x: category, y: value }),
					r,
					styles: {
						dotRadius: disabled?.dotRadius ?? dot?.dotRadius ?? style.dotRadius,
						dotFill: disabled?.dotFill ?? dot?.dotFill ?? stem?.stroke ?? color,
						dotFillOpacity: disabled?.dotFillOpacity ?? dot?.dotFillOpacity,
						dotSymbol: disabled?.dotSymbol ?? dot?.dotSymbol,
						dotStroke: disabled?.dotStroke ?? dot?.dotStroke ?? 'none',
						dotStrokeWidth: disabled?.dotStrokeWidth ?? dot?.dotStrokeWidth,
						dotStrokeOpacity: disabled?.dotStrokeOpacity ?? dot?.dotStrokeOpacity
					}
				};
			});
		});
		const values = state.valueLabels?.show ? state.valueLabels : undefined;
		const labels = values?.writes('value') ? this.#valueLabels(values, state, env) : undefined;
		// The other parts of a row it labels - an interval's ends - beside them; the dots write the value.
		const processed = state.processedData!;
		const position = ProcessedPositions.of(processed, PlotAxes.valueOf(state) as 'x' | 'y');
		const parts = values
			? values.partMarkers(
					env,
					processed.data.filter((row) => !isGapValue(position[PlotAxes.valueOf(state)](row))),
					ValueLabels.bandPoint(state, position[PlotAxes.categoryOf(state)]),
					{
						skip: ['value'],
						seriesColor: (row) => state.colorForSeries!(String(row[SERIES_KEY]))
					}
				)
			: [];
		return [
			...rules,
			...caps,
			...arrows,
			...ValueLabels.onMarkers(dots, 'dot', labels),
			...this.#connectorLabels(state, env, connector, looks, isHorizontal),
			...(parts as AxisBasedMarkersConfig[])
		];
	};

	/** The dash, cap and join a connector is drawn with, leaving out what is not set. */
	static #pattern(
		strokeDasharray: StrokeStyle['strokeDasharray'],
		strokeLinecap: StrokeStyle['strokeLinecap'],
		strokeLinejoin: StrokeStyle['strokeLinejoin']
	): StrokeStyle {
		return {
			...(strokeDasharray ? { strokeDasharray } : {}),
			...(strokeLinecap ? { strokeLinecap } : {}),
			...(strokeLinejoin ? { strokeLinejoin } : {})
		};
	}

	/** The caps of the connectors: a tick at each end of those that have a length, one marker per stroke look. */
	#caps(
		entries: readonly ClevelandEntry[],
		looks: { row: Record<string, unknown> }[],
		length: number,
		isHorizontal: boolean
	): TickMarkerConfig[] {
		const byLook = new Map<
			string,
			{ look: Record<string, unknown>; rows: Record<string, unknown>[] }
		>();
		entries.forEach((entry, index) => {
			if (!(entry.to > entry.from)) return;
			const look = looks[index].row;
			const key = [look.stroke, look.strokeWidth, look.strokeOpacity].join('|');
			const group = byLook.get(key) ?? { look, rows: [] };
			group.rows.push(
				{ category: entry.category, end: entry.from },
				{ category: entry.category, end: entry.to }
			);
			byLook.set(key, group);
		});
		return [...byLook.values()].map(({ look, rows }) => ({
			type: 'tick',
			legend: false,
			data: rows,
			...(isHorizontal ? { x: 'end', y: 'category' } : { x: 'category', y: 'end' }),
			tickLength: length,
			styles: {
				stroke: look.stroke as string,
				strokeWidth: look.strokeWidth as number,
				strokeOpacity: look.strokeOpacity as number
			}
		}));
	}

	/** The label on each connector, when `styles.connector.label` asks for one: written at its middle, beside it or on it. */
	#connectorLabels<TData extends Record<string, unknown>>(
		state: ClevelandPlotState<TData>,
		env: ClevelandPlotEnv,
		connector: ClevelandConnector,
		looks: { range: ConnectorRange; row: Record<string, unknown> }[],
		isHorizontal: boolean
	): TextMarkerConfig[] {
		const label = connector.label;
		if (!label) return [];
		const data = looks.flatMap(({ range, row }): Record<string, unknown>[] => {
			const text = connector.text(range);
			return text === undefined ? [] : [{ ...row, text }];
		});
		if (data.length === 0) return [];
		const font = label.fontStyle;
		// Beside a connector: clear of half its thickest, and a few px.
		const clear =
			Math.max(...data.map((row) => Number(row.strokeWidth))) / 2 + env.cfg.connector.labelGap;
		const inside = label.anchor === 'middle';
		const at: Place = inside
			? { dx: 0, dy: 0, textAnchor: 'middle', lineAnchor: 'middle' }
			: isHorizontal
				? { dx: 0, dy: -clear, textAnchor: 'middle', lineAnchor: 'bottom' }
				: { dx: clear, dy: 0, textAnchor: 'start', lineAnchor: 'middle' };
		return [
			{
				type: 'text',
				data,
				...(isHorizontal ? { x: 'mid', y: 'category' } : { x: 'category', y: 'mid' }),
				text: 'text',
				styles: {
					...font,
					fill: font?.fill ?? 'currentColor',
					fontSize: font?.fontSize ?? env.cfg.connector.labelFontSize,
					dx: font?.dx ?? at.dx,
					dy: font?.dy ?? at.dy,
					textAnchor:
						font?.textAnchor && font.textAnchor !== 'outside' ? font.textAnchor : at.textAnchor,
					lineAnchor: font?.lineAnchor ?? at.lineAnchor
				}
			} satisfies TextMarkerConfig
		];
	}

	/**
	 * The value labels of the dots `styles.values` picks, placed by where each dot sits in its range - or on the
	 * `side` the author asks of them all, or around each dot's rim (`'path'`).
	 */
	#valueLabels<TData extends Record<string, unknown>>(
		labels: ValueLabels,
		state: ClevelandPlotState<TData>,
		env: ClevelandPlotEnv
	): MarkerLabelConfig[] {
		if (!state.processedData?.data.length) return [];
		const { isHorizontal } = ClevelandMarkers.#geometry(state);
		const { font, format } = labels;
		const read = ValueLabels.valueOf(state);
		const valueOf = ProcessedPositions.of(
			state.processedData,
			PlotAxes.valueOf(state) as 'x' | 'y'
		)[PlotAxes.valueOf(state) as 'x' | 'y'];
		const gap = labels.offset(env.cfg[this.#options.config].labelGap);
		const nameOf = (d: ProcessedRow) => String(d[SERIES_KEY]);

		const picked = this.#picked(state);
		// Along the range past an end, across it between them.
		const side = labels.placement.side as PointSide | undefined;
		const own = side && { ...PointLayout.sideOf(side, gap) };
		const placement: Record<ClevelandRole, Place> = own
			? { max: own, min: own, between: own }
			: {
					max: isHorizontal
						? { dx: gap, dy: 0, textAnchor: 'start', lineAnchor: 'middle' }
						: { dx: 0, dy: -gap, textAnchor: 'middle', lineAnchor: 'bottom' },
					min: isHorizontal
						? { dx: -gap, dy: 0, textAnchor: 'end', lineAnchor: 'middle' }
						: { dx: 0, dy: gap, textAnchor: 'middle', lineAnchor: 'top' },
					between: isHorizontal
						? { dx: 0, dy: -gap, textAnchor: 'middle', lineAnchor: 'bottom' }
						: { dx: gap, dy: 0, textAnchor: 'start', lineAnchor: 'middle' }
				};
		const fill =
			labels.fill ??
			(labels.color === 'series'
				? (d: ProcessedRow) => state.colorForSeries!(nameOf(d))
				: 'currentColor');
		if (labels.layout === 'path') {
			const text = (d: ProcessedRow) => format(Number(read(d) ?? valueOf(d)), d, nameOf(d));
			const rim = labels.label(env, text, { fontSize: 12 });
			return [{ ...rim, styles: { ...rim.styles, fill: font?.fill ?? fill } } as MarkerLabelConfig];
		}
		const { styles: shared, ...hooks } = labels.hooks(env);

		return (['max', 'min', 'between'] as const).flatMap((role): PointLabelConfig[] => {
			const rows = new Set(
				picked
					.filter(({ entry, dot }) => ClevelandRanges.roleOf(entry, dot.value) === role)
					.map(({ dot }) => dot.row)
			);
			if (rows.size === 0) return [];
			const at = placement[role];
			return [
				{
					...hooks,
					layout: 'point',
					select: (row: ProcessedRow) => rows.has(row),
					text: (d: ProcessedRow) => format(Number(read(d) ?? valueOf(d)), d, nameOf(d)),
					styles: {
						...shared,
						...font,
						fill,
						fontSize: font?.fontSize ?? 12,
						dx: at.dx,
						dy: at.dy,
						textAnchor: at.textAnchor,
						lineAnchor: at.lineAnchor
					}
				} as PointLabelConfig
			];
		});
	}

	/**
	 * Room for the labels past the dots at the end of the value axis, so the
	 * farthest one fits inside the figure instead of crossing its edge. Only the
	 * dots at the top end of their range reach there, and only the picked ones.
	 */
	reach = <TData extends Record<string, unknown>>(
		labels: ValueLabels,
		state: ClevelandPlotState<TData>
	): EdgeBox[] => {
		const gap = labels.config[this.#options.config].labelGap;
		const top = this.#picked(state).filter(
			({ entry, dot }) => ClevelandRanges.roleOf(entry, dot.value) === 'max'
		);
		if (top.length === 0) return [];
		if (!state.axes?.isHorizontal) {
			const at = { y: -labels.offset(gap) };
			return [labels.edgeBox('0', { x: 'middle', y: 'before' }, at, ['top'])];
		}
		const at = { x: labels.offset(gap) };
		const texts = new Set(top.map(({ dot }) => labels.format(dot.value, dot.row, dot.series)));
		return [...texts].map((text) =>
			labels.edgeBox(text, { x: 'after', y: 'middle' }, at, ['right'])
		);
	};

	/**
	 * The dots `styles.values` labels, each with the category it sits in: the rows
	 * the "transforms" phase picked (`labelled`), traced back to the dots of each
	 * category by the series they belong to.
	 */
	#picked<TData extends Record<string, unknown>>(state: ClevelandPlotState<TData>) {
		const categoryAxis = PlotAxes.categoryOf(state) as 'x' | 'y';
		const position = ProcessedPositions.of(
			state.processedData!,
			PlotAxes.valueOf(state) as 'x' | 'y'
		);
		const ranges = ClevelandRanges.of(
			state,
			this.#options.fromBaseline ?? false,
			{},
			this.#options.interval ?? false
		);
		const keyOf = (category: unknown, series: string) => `${String(category)}\u0000${series}`;
		const chosen = new Set(
			(state.labelled ?? []).map((row) =>
				keyOf(position[categoryAxis](row), String(row[SERIES_KEY]))
			)
		);
		return ranges.entries.flatMap((entry) =>
			entry.dots
				.filter((dot) => chosen.has(keyOf(entry.category, dot.series)))
				.map((dot) => ({ entry, dot }))
		);
	}

	/** Warns, once, when the series layout is not one this plot is for. */
	#validate(ranges: ClevelandRanges): void {
		const problem = this.#options.validate?.(ranges.layout);
		if (!problem) return;
		const message = `${this.#options.name}: ${problem}`;
		if (warned.has(message)) return;
		warned.add(message);
		console.warn(message);
	}

	static #geometry<TData extends Record<string, unknown>>(state: ClevelandPlotState<TData>) {
		return { isHorizontal: state.axes?.isHorizontal ?? false };
	}

	/** How the plot hands its category and value to the marks: raw when the transforms left a plain channel (a field key keeps feeding svelteplot's axis-title inference), through the positions otherwise. */
	static #channels<TData extends Record<string, unknown>>(state: ClevelandPlotState<TData>) {
		const valueAxis = PlotAxes.valueOf(state) as 'x' | 'y';
		const categoryAxis = PlotAxes.categoryOf(state) as 'x' | 'y';
		const { channels } = state.processedData!;
		const position = ProcessedPositions.of(state.processedData!, valueAxis);
		return {
			category: (channels[categoryAxis] ?? position[categoryAxis]) as Channel,
			value: (channels[valueAxis] ?? position[valueAxis]) as ValueChannel
		};
	}
}
