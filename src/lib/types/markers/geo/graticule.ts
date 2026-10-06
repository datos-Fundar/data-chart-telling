import type { StrokeStyle } from '$lib/types/plots/styling';
import type { ClipUnawareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** Longitude and latitude gridlines (svelteplot's `Graticule`). */
export type GeoGraticuleMarkerConfig = {
	type: 'graticule';
	step?: number;
	stepX?: number;
	stepY?: number;
	styles?: StrokeStyle;
	/** Draws behind the base map instead of over it. */
	behind?: boolean;
} & ClipUnawareMarkerConfig;
