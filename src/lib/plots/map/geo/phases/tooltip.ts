import { GeoFeatures } from '$lib/plots/map/geo/GeoFeatures.svelte';
import type { GeoPlotState } from '$lib/types/plots/map/geo/state';

/** GeoPlot's "tooltip" phase: a hovered feature reads as its id. */
export function buildTooltip<TProps extends Record<string, unknown>>(
	state: GeoPlotState<TProps>
): GeoPlotState<TProps> {
	return { ...state, tooltipFormat: (f) => GeoFeatures.defaultId(f) };
}
