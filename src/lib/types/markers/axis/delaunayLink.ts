import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

/** One line per Delaunay triangulation edge (svelteplot's `DelaunayLink`). */
export type DelaunayLinkMarkerConfig = {
	type: 'delaunayLink';
	styles?: AreaStyle;
} & CommonMarkerConfigWithColor;
