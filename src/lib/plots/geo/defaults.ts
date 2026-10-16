import { buildData } from '$lib/plots/geo/phases/data';
import { buildScales } from '$lib/plots/geo/phases/scales';
import { buildMarkers } from '$lib/plots/geo/phases/markers';
import { buildTooltip } from '$lib/plots/geo/phases/tooltip';
import { buildHover } from '$lib/plots/geo/phases/hover';
import type { GeoPlotState, GeoPlotCtx } from '$lib/types/plots/geo/state';
import { Pipeline } from '$lib/phases/Pipeline';

/** GeoPlot's own pipeline (data, scales, markers, tooltip, hover), run over the state its core seeds, hovering one feature at a time. */
export function buildGeoDefaults<TProps extends Record<string, unknown>>(): Pipeline<
	GeoPlotState<TProps>,
	GeoPlotCtx<TProps>
> {
	return new Pipeline<GeoPlotState<TProps>, GeoPlotCtx<TProps>>(
		[
			{ phase: 'data', run: buildData },
			{ phase: 'scales', run: buildScales },
			{ phase: 'markers', run: buildMarkers },
			{ phase: 'tooltip', run: buildTooltip },
			{ phase: 'hover', run: buildHover }
		],
		{ hoverStrategy: 'punctual' }
	);
}
