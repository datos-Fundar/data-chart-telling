import type { AreaStyle } from '$lib/types/plots/styling';
import type { ClipUnawareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** The in-map hover highlight, restyling the hovered feature's own shape. */
export type GeoHoverMarkerConfig = {
	type: 'geo-hover';
	styles?: AreaStyle;
} & ClipUnawareMarkerConfig;
