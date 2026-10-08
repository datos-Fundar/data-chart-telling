import { buildGapFillMaps } from '$lib/plots/utils/gaps';
import { buildBarTransformsOptions } from '$lib/plots/bar/phases/transforms';
import { buildScales } from '$lib/plots/bar/phases/scales';
import { buildMarkers } from '$lib/plots/bar/phases/markers';
import { buildChannelTooltipFormat } from '$lib/layout/tooltip/format';
import type { AxisPlotKind } from '$lib/types/layout/phases';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';

/** Which axis carries the categories: `x` unless only `scales.y` is marked categorical. */
export function categoricalAxisOf(scales: AxisBasedScalesConfig<never> | undefined): 'x' | 'y' {
	const xCategorical = scales?.x?.type === 'categorical';
	return scales?.y?.type === 'categorical' && !xCategorical ? 'y' : 'x';
}

/** The category axis, as the "mapping" phase's own output. */
function withCategoricalAxis<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>
): BarPlotState<TData> {
	if (state.scales.x?.type === 'categorical' && state.scales.y?.type === 'categorical') {
		console.warn(
			"BarPlot: scales.x.type and scales.y.type can't both be 'categorical' - " +
				'mark only one axis as the category axis. Defaulting to x.'
		);
	}
	const categoricalAxis = categoricalAxisOf(state.scales as AxisBasedScalesConfig<never>);
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
		markers: buildMarkers,
		tooltip: { format: (state) => buildChannelTooltipFormat(state, { series: false }) }
	};
}
