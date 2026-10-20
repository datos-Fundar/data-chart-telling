import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import type { LollipopPlotState, LollipopPlotCtx } from '$lib/types/plots/lollipop/state';
import type {
	AxisBasedMarkersConfig,
	DotMarkerConfig,
	RuleMarkerConfig,
	TextMarkerConfig
} from '$lib/types/markers/common';
import type { ProcessedRow } from '$lib/types/phases';
import type { EdgeBox } from '$lib/types/layout/box';

type Channel = RuleMarkerConfig['value'];
type ValueChannel = RuleMarkerConfig['x2'];

/** Where each stem starts along the value axis, and how a row reads its category and value. */
function geometryOf<TData extends Record<string, unknown>>(state: LollipopPlotState<TData>) {
	const valueAxis = PlotAxes.valueOf(state) as 'x' | 'y';
	const categoryAxis = PlotAxes.categoryOf(state) as 'x' | 'y';
	const { channels } = state.processedData!;
	const position = ProcessedPositions.of(state.processedData!, valueAxis);
	return {
		isHorizontal: state.axes?.isHorizontal ?? false,
		valueAxis,
		baseline: PlotAxes.baselineOf(state),
		// Forwarded raw when the transforms left a plain channel (a field key keeps
		// feeding svelteplot's axis-title inference), read through the positions otherwise.
		category: (channels[categoryAxis] ?? position[categoryAxis]) as Channel,
		value: (channels[valueAxis] ?? position[valueAxis]) as ValueChannel,
		valueOf: position[valueAxis]
	};
}

/**
 * Room for the value labels past the dots at the end of the value axis, so
 * the farthest one fits inside the figure instead of crossing its edge.
 */
export function buildValueReach<TData extends Record<string, unknown>>(
	labels: ValueLabels,
	state: LollipopPlotState<TData>
): EdgeBox[] {
	if (!state.axes?.isHorizontal) {
		const at = { y: -labels.offset('y', labels.config.lollipop.labelGap) };
		return [labels.edgeBox('0', { x: 'middle', y: 'before' }, at, ['top'])];
	}
	const at = { x: labels.offset('x', labels.config.lollipop.labelGap) };
	return labels
		.extremes(state.resolvedSeries ?? [], PlotAxes.valueOf(state))
		.map(({ series, value }) =>
			labels.edgeBox(labels.format(value, series.name), { x: 'after', y: 'middle' }, at, ['right'])
		);
}

/**
 * LollipopPlot's `styles.values` as `'text'` markers over the same rows its
 * dots draw, each labelled with its own value just past its dot - on the far
 * side of the baseline from its stem: above (or right of) a dot that rises,
 * below (or left of) one that hangs.
 */
export function buildValueLabels<TData extends Record<string, unknown>>(
	labels: ValueLabels,
	state: LollipopPlotState<TData>,
	ctx: LollipopPlotCtx
): TextMarkerConfig[] {
	if (!state.processedData?.data.length) return [];
	const { isHorizontal, baseline, category, value, valueOf } = geometryOf(state);
	const { font, format } = labels;
	const read = ValueLabels.valueOf(state);
	const nameOf = (d: ProcessedRow) => String(d[SERIES_KEY]);
	const gap = labels.offset(isHorizontal ? 'x' : 'y', ctx.cfg.lollipop.labelGap);
	const labelled = (below: boolean): TextMarkerConfig[] => {
		const data = state.processedData!.data.filter((d) => Number(valueOf(d)) < baseline === below);
		if (data.length === 0) return [];
		// Past the dot: up or right for one that rises, down or left for one that hangs.
		const sign = below ? -1 : 1;
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
					dx: font?.dx ?? (isHorizontal ? sign * gap : 0),
					dy: font?.dy ?? (isHorizontal ? 0 : -sign * gap),
					textAnchor: labels.textAnchor ?? (isHorizontal ? (below ? 'end' : 'start') : 'middle'),
					lineAnchor: font?.lineAnchor ?? (isHorizontal ? 'middle' : below ? 'top' : 'bottom')
				}
			}
		];
	};
	return [...labelled(false), ...labelled(true)];
}

/**
 * LollipopPlot's "markers" phase: per visual segment of each series, a
 * `rule` from the baseline to each value (the stem) and a `dot` at its end,
 * both in the series' color (or the segment's own `stroke`/`dots` styles).
 * The markers the "statistics" phase already put in `state.markers` come
 * after, so they render on top.
 *
 * A series toggled off in the legend (style mode), or dimmed by hovering
 * another one, takes the legend's disabled stroke and dots.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: LollipopPlotState<TData>,
	ctx: LollipopPlotCtx
): AxisBasedMarkersConfig[] {
	const { cfg, interaction } = ctx;
	const { isHorizontal, baseline, category, value } = geometryOf(state);

	return (state.processedGroups ?? []).flatMap((group) => {
		const name = group.series.name;
		const color = state.colorForSeries!(name);
		const disabledStroke = interaction?.strokeFor(name);
		const disabledDots = interaction?.dotsFor(name);
		return group.visualSegments.flatMap((seg): (RuleMarkerConfig | DotMarkerConfig)[] => {
			const stem = seg.styles.stroke;
			const dots = seg.styles.dots;
			const stemColor = stem?.stroke ?? color;
			return [
				{
					type: 'rule',
					series: name,
					data: seg.data,
					axis: isHorizontal ? 'y' : 'x',
					value: category,
					...(isHorizontal ? { x1: baseline, x2: value } : { y1: baseline, y2: value }),
					styles: {
						stroke: disabledStroke?.stroke ?? stemColor,
						strokeWidth: disabledStroke?.strokeWidth ?? stem?.strokeWidth ?? cfg.lollipop.stemWidth,
						strokeOpacity: disabledStroke?.strokeOpacity ?? stem?.strokeOpacity,
						strokeDasharray: disabledStroke?.strokeDasharray ?? stem?.strokeDasharray
					}
				},
				{
					type: 'dot',
					series: name,
					data: seg.data,
					...(isHorizontal ? { x: value, y: category } : { x: category, y: value }),
					styles: {
						dotRadius: disabledDots?.dotRadius ?? dots?.dotRadius ?? cfg.lollipop.dotRadius,
						dotFill: disabledDots?.dotFill ?? dots?.dotFill ?? stemColor,
						dotFillOpacity: disabledDots?.dotFillOpacity ?? dots?.dotFillOpacity,
						dotSymbol: disabledDots?.dotSymbol ?? dots?.dotSymbol,
						dotStroke: disabledDots?.dotStroke ?? dots?.dotStroke ?? 'none',
						dotStrokeWidth: disabledDots?.dotStrokeWidth ?? dots?.dotStrokeWidth,
						dotStrokeOpacity: disabledDots?.dotStrokeOpacity ?? dots?.dotStrokeOpacity
					}
				}
			];
		});
	});
}
