import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { AreaStyle, PerRow } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

/** One line per Delaunay triangulation edge (svelteplot's `DelaunayLink`). */
export type DelaunayLinkMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'delaunayLink';
	styles?: PerRow<AreaStyle, TContext>;
} & CommonMarkerConfigWithColor<TContext>;
