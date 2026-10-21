import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import {
	buildMarks,
	buildValueLabels,
	buildHitAreas,
	buildBarGeometry
} from '$lib/plots/ranking/bar/markers';
import { NiceTicks } from '$lib/layout/scales/NiceTicks';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { AxisScale } from '$lib/types/layout/scales';
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/ranking/bar/state';

/**
 * The domain a bar plot fits to its own bars on its value axis: from zero to
 * the tallest span, niced to as many ticks as fit the plot. Left out when the
 * author pins the axis, and when there is no span to fit.
 */
function fitValueDomain<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>
): Partial<Record<'x' | 'y', Partial<AxisScale<TData>>>> {
	const axis = PlotAxes.valueOf(state);
	const scale = state.scales[axis];
	if (scale?.domain != null || scale?.ticks != null || scale?.nice != null) return {};
	// Every bar's span, as the "transforms" phase left it - its baseline is
	// unknown until the domain is, so a plain bar reads as reaching from zero.
	const { of: spanOf } = ProcessedPositions.span(state.processedData!, axis as 'x' | 'y');
	let lo = 0;
	let hi = 0;
	for (const row of state.processedData?.data ?? []) {
		const span = spanOf(row);
		if (!span) continue;
		lo = Math.min(lo, ...span);
		hi = Math.max(hi, ...span);
	}
	if (hi <= lo) return {};
	return { [axis]: { domain: NiceTicks.fit(state, axis, lo, hi, scale?.niceTolerance) } };
}

/**
 * BarPlot on the shared pipeline: discrete bars with gap fills along one
 * category axis - `x`, or `y` for horizontal bars, as the "data" phase reads
 * it off the values - its own scales (padding, bar layout) and markers.
 * Its plot defaults to: hover along the category axis, timeline tweens matched per category and group.
 */
export function buildBarDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	BarPlotState<TData>,
	BarPlotCtx
> {
	return {
		data: {
			discreteAxes: 1,
			segments: { color: (style: BarSegmentStyle | undefined) => style?.fill, connect: false }
		},
		scales: {
			zero: ['value'],
			defaults: (_state, ctx) => ({
				category: { paddingInner: ctx.cfg.bar.paddingInner, paddingOuter: ctx.cfg.bar.paddingOuter }
			}),
			fit: fitValueDomain
		},
		styles: {
			values: {
				// An `'outside'` label sits past its bar's end, which the tallest bar takes to the edge.
				reach: (labels, state) => {
					if (labels.anchor !== 'outside') return [];
					const axis = PlotAxes.valueOf(state) as 'x' | 'y';
					if (ProcessedPositions.span(state.processedData!, axis).stacked) return [];
					if (!state.axes?.isHorizontal) {
						const at = { y: -labels.offset('y') };
						return [labels.edgeBox('0', { x: 'middle', y: 'before' }, at, ['top'])];
					}
					const at = { x: labels.offset('x') };
					return labels
						.extremes(state.resolvedSeries ?? [], PlotAxes.valueOf(state))
						.map(({ series, value }) =>
							labels.edgeBox(labels.format(value, series.name), { x: 'after', y: 'middle' }, at, [
								'right'
							])
						);
				}
			}
		},
		markers: { marks: buildMarks, valueLabels: buildValueLabels },
		hover: {
			// Each bar matched by its own band (see `buildHitAreas`); a grouped bar's dot is
			// drawn in its series' slice of the band.
			pointMatching: 'contains',
			decorate: (state, ctx) => {
				const { sliceOf } = buildBarGeometry(state, ctx.cfg.bar.seriesPadding);
				return (row) => ({
					areaInset: sliceOf(String((row as Record<string, unknown>)[SERIES_KEY]))
				});
			},
			hitAreas: buildHitAreas
		},
		timeline: { interpolation: { value: 'value', key: ['category', 'grouping'] } }
	};
}
