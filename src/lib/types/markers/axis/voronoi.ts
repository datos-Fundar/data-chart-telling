import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { ClipAwareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** One polygon per point, its Voronoi cell (svelteplot's `Voronoi`). */
export type VoronoiMarkerConfig = {
	type: 'voronoi';
	styles?: AreaStyle;
} & CommonMarkerConfigWithColor &
	ClipAwareMarkerConfig;
