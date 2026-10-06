import { buildGapFillMaps } from '$lib/plots/utils/gaps';
import { buildTaggedRows } from '$lib/plots/pyramid/phases/mapping';
import { buildScales } from '$lib/plots/pyramid/phases/scales';
import { buildMarkers } from '$lib/plots/pyramid/phases/markers';
import type { AxisPlotKind } from '$lib/types/layout/phases';
import type { Series } from '$lib/types/plots/data/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type {
	PyramidPlotState,
	PyramidPlotCtx,
	PyramidSeries
} from '$lib/types/plots/pyramid/state';

const byName = <S extends { name: string }>(a: S, b: S) => a.name.localeCompare(b.name);

/**
 * PyramidPlot on the shared pipeline. A pyramid's `x` prop is the magnitude
 * and its `y` the category, so each series is built with them swapped — every
 * series' `x` is its category and `y` its magnitude. Series take sides by the
 * alphabetical order of their names (first left), flipped by
 * `scales.grouping.reverse`, and colors follow that same order.
 */
export function buildPyramidKind<TData extends Record<string, unknown>>(): AxisPlotKind<
	PyramidPlotState<TData>,
	PyramidPlotCtx
> {
	return {
		data: {
			connect: false,
			segmentColor: (style: BarSegmentStyle | undefined) => style?.fill,
			seriesChannels: (state) => ({ x: state.y, y: state.x }),
			orderSeries: (series: Series[], state) => {
				const sorted = [...series].sort(byName).map((s) => s.name);
				const reversed = state.scales.grouping?.reverse ?? false;
				return series.map((s) => {
					const side = (sorted.indexOf(s.name) % 2 === 0) !== reversed ? 'left' : 'right';
					return { ...s, side } as PyramidSeries<Record<string, unknown>>;
				});
			},
			colorOrder: (series) => [...series].sort(byName),
			extend: (state) => ({
				...state,
				gapFillMaps: buildGapFillMaps(state.resolvedSeries ?? [], state.gaps)
			})
		},
		mapping: { extend: buildTaggedRows },
		scales: { override: buildScales },
		markers: buildMarkers
	};
}
