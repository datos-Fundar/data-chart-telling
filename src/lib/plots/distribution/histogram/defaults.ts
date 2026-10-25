import { buildMarks, buildValueLabels } from '$lib/plots/distribution/histogram/markers';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { resolveAccessor } from '$lib/utils/accessors';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { AxisPlotDefaults, ProcessedChannel, ProcessedRow } from '$lib/types/phases';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { BinXTransform, BinYTransform, MarkerTransform } from '$lib/types/transforms';
import type { AreaStyle } from '$lib/types/plots/styling';
import type {
	HistogramPlotState,
	HistogramPlotCtx
} from '$lib/types/plots/distribution/histogram/state';

/** One processed channel's value on a row - `undefined` for a channel the transforms didn't set. */
function readChannel(channel: ProcessedChannel | undefined): (row: ProcessedRow) => unknown {
	return channel === undefined
		? () => undefined
		: (resolveAccessor(channel as never) as (row: ProcessedRow) => unknown);
}

type Bin = BinXTransform | BinYTransform;

/**
 * The plot's own bins of its axis merged over the default one - counts per
 * bin, with the configured inset on each side of every bar - the author's
 * props winning, and every other transform kept after it in order. A
 * histogram bins once, so several entries fold into one.
 */
function mergeBin(own: MarkerTransform[], cfg: PlotStylesConfig, horizontal: boolean) {
	const { inset } = cfg.histogram;
	const base: Bin = horizontal
		? { type: 'binY', x: 'count', insetTop: inset, insetBottom: inset }
		: { type: 'binX', y: 'count', insetLeft: inset, insetRight: inset };
	const bins = own.filter((t): t is Bin => t.type === base.type);
	const others = own.filter((t) => t.type !== base.type);
	const bin = bins.reduce<Bin>((merged, t) => ({ ...merged, ...t }) as Bin, base);
	return [bin, ...others];
}

/**
 * HistogramPlot on the shared pipeline: series read one position channel -
 * `x`, or `y` for a horizontal histogram - binned by the plot's transforms
 * merged over the default bin of that axis, bars from a zero baseline, and its
 * own markers. Its plot defaults to: hover along the binned axis.
 */
export function buildHistogramDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	HistogramPlotState<TData>,
	HistogramPlotCtx
> {
	return {
		data: { segments: { color: (style: AreaStyle | undefined) => style?.fill, connect: false } },
		transforms: {
			transforms: (state, ctx) =>
				mergeBin(state.transforms ?? [], ctx.cfg, state.axes?.isHorizontal ?? false)
		},
		scales: { zero: ['value'] },
		styles: {
			values: {
				// An `'outside'` label sits past its bin's end, which the longest bin takes to the edge.
				reach: (labels, state) => {
					if (labels.anchor !== 'outside') return [];
					return state.axes?.isHorizontal
						? [
								labels.edgeBox('0', { x: 'after', y: 'middle' }, { x: labels.offset('x') }, [
									'right'
								])
							]
						: [
								labels.edgeBox('0', { x: 'middle', y: 'before' }, { y: -labels.offset('y') }, [
									'top'
								])
							];
				}
			}
		},
		markers: { marks: buildMarks, valueLabels: buildValueLabels },
		hover: {
			// A hovered bin is labelled with its count, and reads as its row plus its count,
			// the edges it spans and its series.
			label: (state) => {
				const count = readChannel(state.processedData!.channels[PlotAxes.valueOf(state)]);
				return ((row: ProcessedRow) => String(Number(count(row)))) as (row: never) => string;
			},
			row: (state) => {
				const { channels } = state.processedData!;
				const value = PlotAxes.valueOf(state);
				const binned = PlotAxes.other(value);
				const [count, from, to] = [
					channels[value],
					channels[`${binned}1`],
					channels[`${binned}2`]
				].map(readChannel);
				return ((row: ProcessedRow) => ({
					...row,
					count: Number(count(row)),
					from: Number(from(row)),
					to: Number(to(row)),
					group: row[SERIES_KEY]
				})) as (row: never) => unknown;
			}
		}
	};
}
