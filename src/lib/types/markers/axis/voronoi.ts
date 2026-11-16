import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { AreaStyle, PerRow } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

/** One polygon per point, its Voronoi cell (svelteplot's `Voronoi`). */
export type VoronoiMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'voronoi';
	styles?: PerRow<AreaStyle, TContext>;
} & CommonMarkerConfigWithColor<TContext>;
