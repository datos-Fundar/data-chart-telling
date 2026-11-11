import { buildMarks } from '$lib/plots/distribution/box/markers';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { HoverDefaults } from '$lib/layout/hover/HoverDefaults';
import { BoxSummaries } from '$lib/plots/distribution/box/BoxSummaries';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { BoxPlotState, BoxPlotEnv } from '$lib/types/plots/distribution/box/state';

/**
 * BoxPlot on the shared pipeline: one box per category of each series along
 * one category axis - `x`, or `y` for horizontal boxes, as the "data" phase
 * reads it off the values, in the order the data gives them - with its own
 * band padding and markers. The value
 * axis fits the values, without reaching for zero. Its plot defaults to:
 * hover along the category axis, over one summary per box rather than every
 * value inside it.
 */
export function buildBoxDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	BoxPlotState<TData>,
	BoxPlotEnv
> {
	return {
		data: {
			discreteAxes: 1,
			segments: {
				color: (style: AreaStyle | undefined) => style?.fill,
				connect: false,
				base: { flat: 'area' }
			}
		},
		scales: {
			bandOrder: 'data',
			defaults: (_state, env) => ({
				category: { paddingInner: env.cfg.box.paddingInner, paddingOuter: env.cfg.box.paddingOuter }
			})
		},
		// Each value's box: its quartiles and whiskers, worked out once for its tooltip and hover to read.
		context: (state) => BoxSummaries.context(state) as (row: never) => object | undefined,
		styles: {
			values: {
				layout: 'point',
				// A quartile is worked out, not read: at most two decimals, as the tooltip writes it.
				format: (value, number) => number(Math.round(value * 100) / 100),
				parts: {
					placements: BoxSummaries.partPlacements,
					default: ['min', 'median', 'max']
				}
			}
		},
		markers: { marks: buildMarks },
		hover: {
			// The hovered category's band behind its shape.
			marker: (state) => HoverDefaults.behindBand(PlotAxes.other(PlotAxes.valueOf(state))),
			rows: BoxSummaries.of,
			position: BoxSummaries.position,
			format: (state) => BoxSummaries.format(state) as (row: never) => string
		}
	};
}
