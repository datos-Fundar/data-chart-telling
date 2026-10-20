import { ClevelandMarkers } from '$lib/plots/cleveland/ClevelandMarkers';
import { ClevelandRanges } from '$lib/plots/cleveland/ClevelandRanges';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type {
	ClevelandOptions,
	ClevelandPlotState,
	ClevelandPlotCtx
} from '$lib/types/plots/cleveland/state';

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
