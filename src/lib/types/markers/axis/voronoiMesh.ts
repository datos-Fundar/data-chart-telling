import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

/** The Voronoi diagram as one mesh path (svelteplot's `VoronoiMesh`). */
export type VoronoiMeshMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'voronoiMesh';
	styles?: AreaStyle;
} & CommonMarkerConfigWithColor<TContext>;
