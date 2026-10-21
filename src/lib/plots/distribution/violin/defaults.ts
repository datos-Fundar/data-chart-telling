import { buildMarks } from '$lib/plots/distribution/violin/markers';
import { BoxSummaries } from '$lib/plots/distribution/box/BoxSummaries';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { NiceTicks } from '$lib/layout/scales/NiceTicks';
import { TooltipState } from '$lib/layout/tooltip/TooltipState.svelte';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { BoxSummaryRow } from '$lib/types/plots/distribution/box/state';
import type { ViolinPlotState, ViolinPlotCtx } from '$lib/types/plots/distribution/violin/state';

/**
 * The value axis fit to the values the violins are drawn from, when the author leaves it unpinned: no svelteplot mark reads them, so nothing else sets its domain.
 */
function fitValueDomain<TData extends Record<string, unknown>>(state: ViolinPlotState<TData>) {
	const axis = PlotAxes.valueOf(state);
	const scale = state.scales[axis];
	if (scale?.domain != null || scale?.ticks != null || scale?.nice != null) return {};
	const values = ProcessedPositions.values(state.processedData, axis)
		.map(Number)
		.filter(Number.isFinite);
	const lo = Math.min(...values);
	const hi = Math.max(...values);
	if (!(hi > lo)) return {};
	return { [axis]: { domain: NiceTicks.fit(state, axis, lo, hi, scale?.niceTolerance) } };
}

/**
 * ViolinPlot on the shared pipeline: one violin per category of each series
 * along one category axis - `x`, or `y` for horizontal violins - in the order
 * the data gives them, with its own band padding and markers. The value axis
 * fits the values, without reaching for zero. Its plot defaults to: hover
 * along the category axis, over one summary per violin, read as a box plot's.
 */
export function buildViolinDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	ViolinPlotState<TData>,
	ViolinPlotCtx
> {
	return {
		data: {
			discreteAxes: 1,
			segments: { color: (style: AreaStyle | undefined) => style?.fill, connect: false }
		},
		scales: {
			bandOrder: 'data',
			fit: (state) => fitValueDomain(state),
			defaults: (_state, ctx) => ({
				category: {
					paddingInner: ctx.cfg.violin.paddingInner,
					paddingOuter: ctx.cfg.violin.paddingOuter
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
