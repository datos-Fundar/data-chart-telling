import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

/** The convex hull around a cluster of points (svelteplot's `Hull`). */
export type HullMarkerConfig = {
	type: 'hull';
	styles?: AreaStyle;
} & CommonMarkerConfigWithColor;
