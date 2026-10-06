import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { ClipAwareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** One line per Delaunay triangulation edge (svelteplot's `DelaunayLink`). */
export type DelaunayLinkMarkerConfig = {
	type: 'delaunayLink';
	styles?: AreaStyle;
} & CommonMarkerConfigWithColor &
	ClipAwareMarkerConfig;
