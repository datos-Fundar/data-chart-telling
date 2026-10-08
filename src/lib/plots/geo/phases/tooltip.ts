import { defaultFeatureId } from '$lib/plots/utils/geoAccessors';
import type { GeoPlotState } from '$lib/types/plots/geo/state';

/** GeoPlot's "tooltip" phase: a hovered feature reads as its id. */
export function buildTooltip<TProps extends Record<string, unknown>>(
	state: GeoPlotState<TProps>
): GeoPlotState<TProps> {
	return { ...state, tooltipFormat: (f) => defaultFeatureId(f) };
}
