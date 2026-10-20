import { buildMarks } from '$lib/plots/box/markers';
import { BoxSummaries } from '$lib/plots/box/BoxSummaries';
import { TooltipState } from '$lib/layout/tooltip/TooltipState.svelte';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { BoxPlotState, BoxPlotCtx, BoxSummaryRow } from '$lib/types/plots/box/state';

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
	BoxPlotCtx
> {
	return {
		data: {
			discreteAxes: 1,
			segments: { color: (style: AreaStyle | undefined) => style?.fill, connect: false }
		},
		scales: {
			bandOrder: 'data',
			defaults: (_state, ctx) => ({
				category: { paddingInner: ctx.cfg.box.paddingInner, paddingOuter: ctx.cfg.box.paddingOuter }
			})
		},
		markers: { marks: buildMarks },
		hover: {
			rows: BoxSummaries.of,
			position: BoxSummaries.position,
			label: () => ((row: BoxSummaryRow) => String(row.median)) as (row: never) => string,
			format: (state) => BoxSummaries.format(state) as (row: never) => string,
			sort: () =>
				TooltipState.descending((row: BoxSummaryRow) => row.median) as (
					a: never,
					b: never
				) => number
		}
	};
}
