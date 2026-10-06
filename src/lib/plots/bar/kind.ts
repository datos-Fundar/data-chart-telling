import { buildGapFillMaps } from '$lib/plots/utils/gaps';
import { buildBarTransformsOptions } from '$lib/plots/bar/phases/transforms';
import { buildScales } from '$lib/plots/bar/phases/scales';
import { buildMarkers } from '$lib/plots/bar/phases/markers';
import type { AxisPlotKind } from '$lib/types/layout/phases';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';

/** Which axis carries the categories: `x` unless `scales.y` is marked categorical. */
function withCategoricalAxis<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>
): BarPlotState<TData> {
	const xCategorical = state.scales.x?.type === 'categorical';
	const yCategorical = state.scales.y?.type === 'categorical';
	let categoricalAxis: 'x' | 'y' = 'x';
	if (xCategorical && yCategorical) {
		console.warn(
			"BarPlot: scales.x.type and scales.y.type can't both be 'categorical' — " +
				'mark only one axis as the category axis. Defaulting to x.'
		);
	} else if (yCategorical) {
		categoricalAxis = 'y';
	}
	return { ...state, categoricalAxis, isHorizontal: categoricalAxis === 'y' };
}

/**
 * BarPlot on the shared pipeline: discrete bars with gap fills, the category
 * axis read off `scales`, its own scales (padding, bar layout) and markers.
 */
export function buildBarKind<TData extends Record<string, unknown>>(): AxisPlotKind<
	BarPlotState<TData>,
	BarPlotCtx
> {
	return {
		data: {
			connect: false,
			segmentColor: (style: BarSegmentStyle | undefined) => style?.fill,
			extend: (state) => ({
				...state,
				gapFillMaps: buildGapFillMaps(state.resolvedSeries ?? [], state.gaps)
			})
		},
		mapping: { extend: withCategoricalAxis },
		transforms: buildBarTransformsOptions<TData>(),
		scales: { override: buildScales },
		markers: buildMarkers
	};
}
