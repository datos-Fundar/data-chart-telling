import { ClevelandMarkers } from '$lib/plots/ranking/cleveland/ClevelandMarkers';
import { ClevelandRanges } from '$lib/plots/ranking/cleveland/ClevelandRanges';
import { NiceTicks } from '$lib/layout/scales/NiceTicks';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { AxisScale } from '$lib/types/layout/scales';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type {
	ClevelandOptions,
	ClevelandPlotState,
	ClevelandPlotCtx
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
): AxisPlotDefaults<ClevelandPlotState<TData>, ClevelandPlotCtx> {
	const markers = new ClevelandMarkers(options);
	return {
		data: {
			discreteAxes: 1,
			segments: {
				color: (style: LineSegmentStyle | undefined) =>
					style?.dots?.dotFill ?? style?.stroke?.stroke,
				connect: false
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
			defaults: (_state, ctx) => ({
				category: {
					paddingInner: ctx.cfg[options.config].paddingInner,
					paddingOuter: ctx.cfg[options.config].paddingOuter
				}
			})
		},
		// A dot is labelled by what its category's dots say: the first, the highest... of each.
		transforms: { labels: { group: 'category', skip: ClevelandRanges.skipGaps } },
		styles: { values: { reach: markers.reach } },
		markers: { marks: markers.marks, valueLabels: markers.valueLabels }
	};
}
