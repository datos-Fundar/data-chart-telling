import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { ClipAwareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** The Voronoi diagram as one mesh path (svelteplot's `VoronoiMesh`). */
export type VoronoiMeshMarkerConfig = {
	type: 'voronoiMesh';
	styles?: AreaStyle;
} & CommonMarkerConfigWithColor &
	ClipAwareMarkerConfig;
