import { buildMarks } from '$lib/plots/distribution/raincloud/markers';
import { RaincloudLayout } from '$lib/plots/distribution/raincloud/layout';
import { fitValueDomain } from '$lib/plots/distribution/violin/defaults';
import { BoxSummaries } from '$lib/plots/distribution/box/BoxSummaries';
import { TooltipState } from '$lib/layout/tooltip/TooltipState.svelte';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { BoxSummaryRow } from '$lib/types/plots/distribution/box/state';
import type {
	RaincloudPlotState,
	RaincloudPlotCtx
} from '$lib/types/plots/distribution/raincloud/state';

/**
 * RaincloudPlot on the shared pipeline: one raincloud per category of each
 * series along one category axis - `x`, or `y` for horizontal ones - in the
 * order the data gives them, with its own band padding and markers. Its rows are
 * scattered across their band by a jitter and a shift of the category axis, run
 * before the plot's own transforms. The value axis fits the values, without
 * reaching for zero. Its plot defaults to: hover along the category axis, over
 * one summary per raincloud, read as a box plot's.
 */
export function buildRaincloudDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	RaincloudPlotState<TData>,
	RaincloudPlotCtx
> {
	return {
		data: {
			discreteAxes: 1,
			segments: {
				color: (style: AreaStyle | undefined) => style?.fill,
				connect: false,
				gather: true
			}
		},
		transforms: { transforms: (state) => RaincloudLayout.transforms(state) },
		scales: {
			bandOrder: 'data',
			fit: (state) => fitValueDomain(state),
			defaults: (_state, ctx) => ({
				category: {
					paddingInner: ctx.cfg.raincloud.paddingInner,
					paddingOuter: ctx.cfg.raincloud.paddingOuter
				}
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
