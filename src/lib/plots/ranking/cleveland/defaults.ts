import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import { RowNumbers, type IntervalAccessors } from '$lib/plots/utils/RowNumbers';
import type { ProcessedRow } from '$lib/types/phases';
import { ClevelandMarkers } from '$lib/plots/ranking/cleveland/ClevelandMarkers';
import { HoverDefaults } from '$lib/layout/hover/HoverDefaults';
import { ClevelandRanges } from '$lib/plots/ranking/cleveland/ClevelandRanges';
import { NiceTicks } from '$lib/layout/scales/NiceTicks';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { AxisScale } from '$lib/types/layout/scales';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type {
	ClevelandOptions,
	ClevelandPlotState,
	ClevelandPlotEnv
} from '$lib/types/plots/ranking/cleveland/state';

/**
 * The domain a plot of intervals fits to them on its value axis, niced to as many
 * ticks as fit the plot. Left out when the author pins the axis, or there is
 * nothing to fit.
 */
function fitInterval<TData extends Record<string, unknown>>(
	state: ClevelandPlotState<TData>,
	fromBaseline: boolean
): Partial<Record<'x' | 'y', Partial<AxisScale<TData>>>> {
	const axis = PlotAxes.valueOf(state);
	const scale = state.scales[axis];
	if (scale?.domain != null || scale?.ticks != null || typeof scale?.nice === 'boolean') return {};
	const { entries } = ClevelandRanges.of(state, fromBaseline, {}, true);
	if (entries.length === 0) return {};
	const lo = Math.min(...entries.map((entry) => entry.from));
	const hi = Math.max(...entries.map((entry) => entry.to));
	if (!(hi > lo)) return {};
	return {
		[axis]: { domain: NiceTicks.fit(state, axis, lo, hi, NiceTicks.toleranceOf(scale?.nice)) }
	};
}

/**
 * ClevelandPlot on the shared pipeline, and the base of its wrappers: per
 * category along one category axis - `x`, or `y` for sideways rows, as the
 * "data" phase reads it off the values - one dot for each series that has a
 * value there, joined by a connector from the lowest to the highest. The
 * `options` set one plot of the family apart: its name, its configuration
 * block, whether the baseline is an end of the range (a lollipop's stem), and
 * what it checks about the series before drawing. Its plot defaults to hover
 * along the category axis.
 */
export function buildClevelandDefaults<TData extends Record<string, unknown>>(
	options: ClevelandOptions = { name: 'ClevelandPlot', config: 'cleveland' }
): AxisPlotDefaults<ClevelandPlotState<TData>, ClevelandPlotEnv> {
	const markers = new ClevelandMarkers(options);
	return {
		data: {
			discreteAxes: 1,
			segments: {
				color: (style: LineSegmentStyle | undefined) =>
					style?.dot?.dotFill ?? style?.stroke?.stroke,
				connect: false,
				// The stem's `styles.stroke` is not a segment's: a connector the author styles wins over it (see `ClevelandMarkers`).
				base: { nested: ['dot'] }
			}
		},
		scales: {
			// A stem rises from the baseline, which the value axis then reaches.
			zero: options.fromBaseline ? ['value'] : [],
			bandOrder: 'data',
			// An interval's ends are values the axis must reach, and the dots alone do not say where they are.
			fit: options.interval
				? (state) => fitInterval(state, options.fromBaseline ?? false)
				: undefined,
			defaults: (_state, env) => ({
				category: {
					paddingInner: env.cfg[options.config].paddingInner,
					paddingOuter: env.cfg[options.config].paddingOuter
				}
			})
		},
		// A dot is labelled by what its category's dots say: the first, the highest... of each.
		transforms: { labels: { group: 'category', skip: ClevelandRanges.skipGaps } },
		// An interval's ends, for its tooltip, hover and value labels to read.
		context: options.interval
			? (state) => {
					const valueOf = ValueLabels.valueOf(state);
					return ((row: ProcessedRow) => {
						const [lower, upper] = RowNumbers.interval(
							state as unknown as IntervalAccessors,
							row,
							Number(valueOf(row))
						);
						return { lower, upper };
					}) as (row: never) => object;
				}
			: undefined,
		styles: {
			values: {
				layout: 'point',
				layouts: { path: { side: 'outside' } },
				// An interval's ends sit past it, each on its own side.
				parts: options.interval
					? {
							placements: (state) => {
								const sideways = state.axes?.isHorizontal;
								return {
									lower: { side: sideways ? 'before' : 'below' },
									upper: { side: sideways ? 'after' : 'above' }
								};
							},
							default: ['value']
						}
					: undefined,
				reach: (labels, state) => (labels.layout === 'point' ? markers.reach(labels, state) : [])
			}
		},
		markers: { marks: markers.marks },
		// A rule along the value axis at the hovered dot, and a dot and a label on each one of its category.
		hover: { marker: (state) => HoverDefaults.valueRule(PlotAxes.valueOf(state)) }
	};
}
