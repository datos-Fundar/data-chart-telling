import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

/** One polygon per point, its Voronoi cell (svelteplot's `Voronoi`). */
export type VoronoiMarkerConfig = {
	type: 'voronoi';
	styles?: AreaStyle;
} & CommonMarkerConfigWithColor;
