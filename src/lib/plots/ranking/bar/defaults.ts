import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { buildMarks, buildHitAreas, buildBarGeometry } from '$lib/plots/ranking/bar/markers';
import { NiceTicks } from '$lib/layout/scales/NiceTicks';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { HoverDefaults } from '$lib/layout/hover/HoverDefaults';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { AxisScale } from '$lib/types/layout/scales';
import type { BarPlotState, BarPlotEnv } from '$lib/types/plots/ranking/bar/state';

/**
 * The domain a bar plot fits to its own bars on its value axis: from zero to
 * the tallest span (and the `extra` values a plot draws beyond its bars), niced to as many ticks as fit the plot. Left out when the
 * author pins the axis, and when there is no span to fit.
 */
export function fitValueDomain<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>,
	extra: readonly number[] = []
): Partial<Record<'x' | 'y', Partial<AxisScale<TData>>>> {
	const axis = PlotAxes.valueOf(state);
	const scale = state.scales[axis];
	if (scale?.domain != null || scale?.ticks != null || typeof scale?.nice === 'boolean') return {};
	// Every bar's span, as the "transforms" phase left it - its baseline is
	// unknown until the domain is, so a plain bar reads as reaching from zero.
	const { of: spanOf } = ProcessedPositions.span(state.processedData!, axis as 'x' | 'y');
	let lo = 0;
	let hi = 0;
	for (const value of extra) {
		lo = Math.min(lo, value);
		hi = Math.max(hi, value);
	}
	for (const row of state.processedData?.data ?? []) {
		const span = spanOf(row);
		if (!span) continue;
		lo = Math.min(lo, ...span);
		hi = Math.max(hi, ...span);
	}
	if (hi <= lo) return {};
	return {
		[axis]: { domain: NiceTicks.fit(state, axis, lo, hi, NiceTicks.toleranceOf(scale?.nice)) }
	};
}

/**
 * BarPlot on the shared pipeline: discrete bars with gap fills along one
 * category axis - `x`, or `y` for horizontal bars, as the "data" phase reads
 * it off the values - its own scales (padding, bar layout) and markers.
 * Its plot defaults to: hover along the category axis, timeline tweens matched per category and group.
 */
export function buildBarDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	BarPlotState<TData>,
	BarPlotEnv
> {
	return {
		data: {
			discreteAxes: 1,
			segments: {
				color: (style: BarSegmentStyle | undefined) => style?.fill,
				connect: false,
				base: { flat: 'area' }
			}
		},
		scales: {
			zero: ['value'],
			defaults: (_state, env) => ({
				category: { paddingInner: env.cfg.bar.paddingInner, paddingOuter: env.cfg.bar.paddingOuter }
			}),
			fit: (state) => fitValueDomain(state)
		},
		transforms: { labels: {} },
		styles: {
			values: {
				layout: (state) =>
					ProcessedPositions.span(state.processedData!, PlotAxes.valueOf(state) as 'x' | 'y')
						.stacked
						? 'box'
						: 'path',
				layouts: {
					path: { edge: 'tip', side: 'outside' },
					box: { anchor: 'middle' },
					point: { anchor: 'top', side: 'above' }
				},
				// An `'outside'` label sits past its bar's end, which the tallest bar takes to the edge.
				reach: (labels, state) => {
					if (!labels.pastTip) return [];
					const axis = PlotAxes.valueOf(state) as 'x' | 'y';
					if (ProcessedPositions.span(state.processedData!, axis).stacked) return [];
					if (!state.axes?.isHorizontal) {
						const offset = labels.offset();
						const boxes = [
							labels.edgeBox('0', { x: 'middle', y: 'before' }, { y: -offset }, ['top'])
						];
						// A bar below zero has its label under its tip.
						const hasNegative = labels
							.extremes(state.resolvedSeries ?? [], PlotAxes.valueOf(state), 'both')
							.some(({ value }) => value < 0);
						if (hasNegative)
							boxes.push(
								labels.edgeBox('0', { x: 'middle', y: 'after' }, { y: offset }, ['bottom'])
							);
						return boxes;
					}
					// A bar below zero reaches out to the left, with its label turned that way.
					const offset = labels.offset();
					return labels
						.extremes(state.resolvedSeries ?? [], PlotAxes.valueOf(state), 'both')
						.map(({ series, value }) =>
							value < 0
								? labels.edgeBox(
										labels.format(value, undefined, series.name),
										{ x: 'before', y: 'middle' },
										{ x: -offset },
										['left']
									)
								: labels.edgeBox(
										labels.format(value, undefined, series.name),
										{ x: 'after', y: 'middle' },
										{ x: offset },
										['right']
									)
						);
				}
			}
		},
		markers: { marks: buildMarks },
		hover: {
			// Each bar matched by its own band (see `buildHitAreas`); a grouped bar's dot is
			// drawn in its series' slice of the band.
			pointMatching: 'contains',
			decorate: (state, env) => {
				const { sliceOf } = buildBarGeometry(state, env.cfg.bar.seriesPadding);
				return (row) => ({
					areaInset: sliceOf(String((row as Record<string, unknown>)[SERIES_KEY]))
				});
			},
			hitAreas: buildHitAreas,
			// The hovered category's band behind its bars - its series' slice of it, when that bar alone is hovered.
			marker: (state) => ({
				back: [HoverDefaults.band(state.axes?.isHorizontal ? 'y' : 'x')],
				front: []
			})
		},
		timeline: { interpolation: { value: 'value', key: ['category', 'grouping'] } }
	};
}
