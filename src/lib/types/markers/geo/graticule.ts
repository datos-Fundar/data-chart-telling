import type { CommonMarkerEvents } from '$lib/types/markers/channels/commonMarkerEvents';
import type { StrokeStyle } from '$lib/types/plots/styling';

/** Longitude and latitude gridlines (svelteplot's `Graticule`). */
export type GeoGraticuleMarkerConfig = CommonMarkerEvents & {
	type: 'graticule';
	step?: number;
	stepX?: number;
	stepY?: number;
	styles?: StrokeStyle;
	/** Draws behind the base map instead of over it. */
	behind?: boolean;
};
