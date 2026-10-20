import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import { ClevelandRanges } from '$lib/plots/cleveland/ClevelandRanges';
import type {
	ClevelandPlotState,
	ClevelandPlotCtx,
	ClevelandOptions,
	ClevelandEntry,
	ClevelandRole
} from '$lib/types/plots/cleveland/state';
import type {
	AxisBasedMarkersConfig,
	DotMarkerConfig,
	RuleMarkerConfig,
	TextMarkerConfig
} from '$lib/types/markers/common';
import type { ProcessedRow } from '$lib/types/phases';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { TextAnchor, LineAnchor } from '$lib/types/plots/constants';
import type { EdgeBox } from '$lib/types/layout/box';

/** Where a label sits from its dot, and how its text anchors there. */
type Place = { dx: number; dy: number; textAnchor: TextAnchor; lineAnchor: LineAnchor };
type Channel = RuleMarkerConfig['value'];
type ValueChannel = RuleMarkerConfig['x2'];

/** The messages already warned about, so a plot that redraws warns once. */
const warned = new Set<string>();

/**
 * The marks of the Cleveland family of plots, which differ only by their
 * {@link ClevelandOptions}: per category, a connector from its lowest to its
 * highest value (from the baseline, for a lollipop) with a dot at each value.
 * A category with one dot gets a stem in that dot's series color, restyled by
 * the segment its dot belongs to; a category with several gets one neutral
 * connector. The "markers" phase takes its `marks`, `valueLabels` and `reach`.
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
		ctx: ClevelandPlotCtx
	): AxisBasedMarkersConfig[] => {
		const { cfg, interaction } = ctx;
		const style = cfg[this.#options.config];
		const { isHorizontal } = ClevelandMarkers.#geometry(state);
		const ranges = ClevelandRanges.of(state, this.#options.fromBaseline ?? false);
		this.#validate(ranges);

		const connector = (entries: ClevelandEntry[]): Partial<RuleMarkerConfig> => ({
			type: 'rule',
			axis: isHorizontal ? 'y' : 'x',
			data: entries.map((entry) => ({ category: entry.category, from: entry.from, to: entry.to })),
			value: 'category',
			...(isHorizontal ? { x1: 'from', x2: 'to' } : { y1: 'from', y2: 'to' })
		});
		const lone = new Map<LineSegmentStyle, ClevelandEntry[]>();
		const shared: ClevelandEntry[] = [];
		const segmentOf = new Map<ProcessedRow, { series: string; styles: LineSegmentStyle }>();
		const groups = state.processedGroups ?? [];
		for (const group of groups) {
			for (const segment of group.visualSegments) {
				for (const row of segment.data) {
					segmentOf.set(row, { series: group.series.name, styles: segment.styles });
				}
			}
		}
		for (const entry of ranges.entries) {
			if (entry.dots.length !== 1) {
				shared.push(entry);
				continue;
			}
			const owner = segmentOf.get(entry.dots[0].row)!;
			lone.set(owner.styles, [...(lone.get(owner.styles) ?? []), entry]);
		}

		const rules: RuleMarkerConfig[] = [];
		if (shared.length > 0) {
			rules.push({
				...connector(shared),
				styles: {
					stroke: style.connectorColor ?? cfg.axis.color,
					strokeWidth: style.stemWidth
				}
			} as RuleMarkerConfig);
		}
		for (const [styles, entries] of lone) {
			const { series } = segmentOf.get(entries[0].dots[0].row)!;
			const stem = styles.stroke;
			const disabled = interaction?.strokeFor(series);
			rules.push({
				...connector(entries),
				series,
				styles: {
					stroke: disabled?.stroke ?? stem?.stroke ?? state.colorForSeries!(series),
					strokeWidth: disabled?.strokeWidth ?? stem?.strokeWidth ?? style.stemWidth,
					strokeOpacity: disabled?.strokeOpacity ?? stem?.strokeOpacity,
					strokeDasharray: disabled?.strokeDasharray ?? stem?.strokeDasharray
				}
			} as RuleMarkerConfig);
		}

		const { category, value } = ClevelandMarkers.#channels(state);
		const dots = groups.flatMap((group) => {
			const name = group.series.name;
			const color = state.colorForSeries!(name);
			const disabled = interaction?.dotsFor(name);
			return group.visualSegments.map((segment): DotMarkerConfig => {
				const stem = segment.styles.stroke;
				const dot = segment.styles.dots;
				return {
					type: 'dot',
					series: name,
					data: segment.data,
					...(isHorizontal ? { x: value, y: category } : { x: category, y: value }),
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
		}) as DotMarkerConfig[];
		return [...rules, ...dots];
	};

	/**
	 * The value labels, one `'text'` marker per place a dot can hold in its
	 * range: past the top end (above, or right of it), past the bottom end
	 * (below, or left of it) and, for the dots between, beside it.
	 */
	valueLabels = <TData extends Record<string, unknown>>(
		labels: ValueLabels,
		state: ClevelandPlotState<TData>,
		ctx: ClevelandPlotCtx
	): TextMarkerConfig[] => {
		if (!state.processedData?.data.length) return [];
		const { isHorizontal } = ClevelandMarkers.#geometry(state);
		const { category, value } = ClevelandMarkers.#channels(state);
		const { font, format } = labels;
		const read = ValueLabels.valueOf(state);
		const valueOf = ProcessedPositions.of(
			state.processedData,
			PlotAxes.valueOf(state) as 'x' | 'y'
		)[PlotAxes.valueOf(state) as 'x' | 'y'];
		const gap = labels.offset(isHorizontal ? 'x' : 'y', ctx.cfg[this.#options.config].labelGap);
		const nameOf = (d: ProcessedRow) => String(d[SERIES_KEY]);

		const ranges = ClevelandRanges.of(state, this.#options.fromBaseline ?? false);
		const rowsBy = (role: ClevelandRole) =>
			ranges.entries.flatMap((entry) =>
				entry.dots
					.filter((dot) => ClevelandRanges.roleOf(entry, dot.value) === role)
					.map((dot) => dot.row)
			);
		// Where a label sits from its dot, by role: along the range (past an end) or across it (between).
		const placement: Record<ClevelandRole, Place> = {
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

		return (['max', 'min', 'between'] as const).flatMap((role): TextMarkerConfig[] => {
			const data = rowsBy(role);
			if (data.length === 0) return [];
			const at = placement[role];
			return [
				{
					type: 'text',
					data,
					...(isHorizontal ? { x: value, y: category } : { x: category, y: value }),
					text: (d: ProcessedRow) => format(Number(read(d) ?? valueOf(d)), nameOf(d)),
					styles: {
						...font,
						fill: font?.fill ?? ctx.cfg.axis.color,
						fontSize: font?.fontSize ?? 12,
						dx: font?.dx ?? at.dx,
						dy: font?.dy ?? at.dy,
						textAnchor: labels.textAnchor ?? at.textAnchor,
						lineAnchor: font?.lineAnchor ?? at.lineAnchor
					}
				}
			];
		});
	};

	/**
	 * Room for the value labels past the dots at the end of the value axis, so
	 * the farthest one fits inside the figure instead of crossing its edge.
	 */
	reach = <TData extends Record<string, unknown>>(
		labels: ValueLabels,
		state: ClevelandPlotState<TData>
	): EdgeBox[] => {
		const gap = labels.config[this.#options.config].labelGap;
		if (!state.axes?.isHorizontal) {
			const at = { y: -labels.offset('y', gap) };
			return [labels.edgeBox('0', { x: 'middle', y: 'before' }, at, ['top'])];
		}
		const at = { x: labels.offset('x', gap) };
		return labels
			.extremes(state.resolvedSeries ?? [], PlotAxes.valueOf(state))
			.map(({ series, value }) =>
				labels.edgeBox(labels.format(value, series.name), { x: 'after', y: 'middle' }, at, [
					'right'
				])
			);
	};

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
