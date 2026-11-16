import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

/** The convex hull around a cluster of points (svelteplot's `Hull`). */
export type HullMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'hull';
	styles?: AreaStyle;
} & CommonMarkerConfigWithColor<TContext>;
