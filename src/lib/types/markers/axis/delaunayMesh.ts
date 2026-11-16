import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

/** The Delaunay triangulation as one mesh path (svelteplot's `DelaunayMesh`). */
export type DelaunayMeshMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'delaunayMesh';
	styles?: AreaStyle;
} & CommonMarkerConfigWithColor<TContext>;
