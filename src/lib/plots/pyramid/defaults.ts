import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { buildMarks, buildValueLabels } from '$lib/plots/pyramid/markers';
import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import { seriesIdOf } from '$lib/utils/grouping';
import { isGapValue } from '$lib/plots/utils/gaps';
import { SERIES_ID_KEY, TransformsPhase } from '$lib/phases/transforms/TransformsPhase';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { ProcessedRow } from '$lib/types/phases';
import type { Series } from '$lib/types/plots/data/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type {
	PyramidPlotState,
	PyramidPlotCtx,
	PyramidSeries
} from '$lib/types/plots/pyramid/state';

const byName = <S extends { name: string }>(a: S, b: S) => a.name.localeCompare(b.name);

/**
 * PyramidPlot on the shared pipeline. Its `x`/`y` are the visual axes: the one
 * holding categories (read off the values by the "data" phase) runs the bars,
 * so categories on `y` make the classic horizontal pyramid and categories on
 * `x` a vertical one. Series take sides by the alphabetical order of their
 * names (first left, or bottom), flipped by `scales.grouping.reverse`, and
 * colors follow that same order. A bar's tooltip reads its side, then its
 * category and magnitude.
 * Its plot defaults to: hover along the category axis; the tween is of the magnitude, keyed by category and side.
 */
export function buildPyramidDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	PyramidPlotState<TData>,
	PyramidPlotCtx
> {
	return {
		data: {
			discreteAxes: 1,
			segments: { color: (style: BarSegmentStyle | undefined) => style?.fill, connect: false },
			orderSeries: (series: Series[], state) => {
				const sorted = [...series].sort(byName).map((s) => s.name);
				const reversed = state.scales.grouping?.reverse ?? false;
				return series.map((s) => {
					const side = (sorted.indexOf(s.name) % 2 === 0) !== reversed ? 'left' : 'right';
					return { ...s, side } as PyramidSeries<Record<string, unknown>>;
				});
			},
			colorOrder: (series) => [...series].sort(byName)
		},
		scales: {
			// Both sides read as magnitudes, on an axis as long below zero as above it.
			symmetric: ['value'],
			bandOrder: 'data',
			defaults: () => ({
				category: { padding: 0.2 },
				value: { tickFormat: (v: unknown) => String(Math.abs(Number(v))) }
			})
		},
		styles: {
			values: {
				// A label past its bar's end reaches out on its own side, the longest bar's to the edge.
				reach: (labels, state) => {
					if (labels.anchor === 'middle' || labels.anchor === 'end') return [];
					const axis = PlotAxes.valueOf(state);
					const isHorizontal = state.axes?.isHorizontal ?? true;
					const offset = labels.offset(axis);
					return labels.extremes(state.resolvedSeries ?? [], axis).map(({ series, value }) => {
						const left = series.side === 'left';
						const text = labels.format(Math.abs(value), series.name);
						return isHorizontal
							? labels.edgeBox(
									text,
									{ x: left ? 'before' : 'after', y: 'middle' },
									{ x: left ? -offset : offset },
									[left ? 'left' : 'right']
								)
							: labels.edgeBox(
									text,
									{ x: 'middle', y: left ? 'after' : 'before' },
									{ y: left ? offset : -offset },
									[left ? 'bottom' : 'top']
								);
					});
				}
			}
		},
		markers: { marks: buildMarks, valueLabels: buildValueLabels },
		hover: {
			// A bar sits at its signed magnitude - below or left of the baseline on the first
			// side - and its category, and reads as its magnitude.
			position: (state) => {
				const value = PlotAxes.valueOf(state);
				const place = TransformsPhase.processedPosition(state.processedData!, value);
				const valueOf = ValueLabels.valueOf(state);
				const sideOf = new Map((state.resolvedSeries ?? []).map((s) => [seriesIdOf(s), s.side]));
				const signed = (row: ProcessedRow) => {
					const raw = valueOf(row);
					if (isGapValue(raw)) return raw;
					const magnitude = Math.abs(Number(raw));
					return sideOf.get(String(row[SERIES_ID_KEY])) === 'left' ? -magnitude : magnitude;
				};
				return value === 'x' ? { x: signed, y: place.y } : { x: place.x, y: signed };
			},
			label: (state) => {
				const valueOf = ValueLabels.valueOf(state);
				return (row) => String(Math.abs(Number(valueOf(row as ProcessedRow))));
			}
		},
		timeline: { interpolation: { value: 'value', key: ['category', 'grouping'] } }
	};
}
