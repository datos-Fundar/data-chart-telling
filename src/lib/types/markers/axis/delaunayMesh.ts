import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { ClipAwareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** The Delaunay triangulation as one mesh path (svelteplot's `DelaunayMesh`). */
export type DelaunayMeshMarkerConfig = {
	type: 'delaunayMesh';
	styles?: AreaStyle;
} & CommonMarkerConfigWithColor &
	ClipAwareMarkerConfig;
