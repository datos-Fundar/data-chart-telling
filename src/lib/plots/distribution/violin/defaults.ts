import { buildMarks } from '$lib/plots/distribution/violin/markers';
import { HoverDefaults } from '$lib/layout/hover/HoverDefaults';
import { BoxSummaries } from '$lib/plots/distribution/box/BoxSummaries';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { NiceTicks } from '$lib/layout/scales/NiceTicks';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { ViolinPlotState, ViolinPlotEnv } from '$lib/types/plots/distribution/violin/state';

/**
 * The value axis fit to the values the violins are drawn from, when the author leaves it unpinned: no svelteplot mark reads them, so nothing else sets its domain.
 */
function fitValueDomain<TData extends Record<string, unknown>>(state: ViolinPlotState<TData>) {
	const axis = PlotAxes.valueOf(state);
	const scale = state.scales[axis];
	if (scale?.domain != null || scale?.ticks != null || typeof scale?.nice === 'boolean') return {};
	const values = ProcessedPositions.values(state.processedData, axis)
		.map(Number)
		.filter(Number.isFinite);
	const lo = Math.min(...values);
	const hi = Math.max(...values);
	if (!(hi > lo)) return {};
	return {
		[axis]: { domain: NiceTicks.fit(state, axis, lo, hi, NiceTicks.toleranceOf(scale?.nice)) }
	};
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
	ViolinPlotEnv
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
			fit: (state) => fitValueDomain(state),
			defaults: (_state, env) => ({
				category: {
					paddingInner: env.cfg.violin.paddingInner,
					paddingOuter: env.cfg.violin.paddingOuter
				}
			})
		},
		// Each value's box: its quartiles and whiskers, worked out once for its tooltip and hover to read.
		context: (state) => BoxSummaries.context(state) as (row: never) => object | undefined,
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
