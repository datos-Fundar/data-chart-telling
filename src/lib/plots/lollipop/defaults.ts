import { buildMarks, buildValueLabels, buildValueReach } from '$lib/plots/lollipop/markers';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { LollipopPlotState, LollipopPlotCtx } from '$lib/types/plots/lollipop/state';

/**
 * LollipopPlot on the shared pipeline: one stem and dot per category of each
 * series along one category axis - `x`, or `y` for sideways lollipops, as the
 * "data" phase reads it off the values - with its own band padding and
 * markers. The value axis reaches zero, where the stems start. Its plot
 * defaults to hover along the category axis.
 */
export function buildLollipopDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	LollipopPlotState<TData>,
	LollipopPlotCtx
> {
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
			zero: ['value'],
			bandOrder: 'data',
			defaults: (_state, ctx) => ({
				category: {
					paddingInner: ctx.cfg.lollipop.paddingInner,
					paddingOuter: ctx.cfg.lollipop.paddingOuter
				}
			})
		},
		styles: { values: { reach: buildValueReach } },
		markers: { marks: buildMarks, valueLabels: buildValueLabels }
	};
}
