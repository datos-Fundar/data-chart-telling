import type { StrokeStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { ClipAwareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** A short tick per row along one axis (svelteplot's `TickX`/`TickY`). */
export type TickMarkerConfig = {
	type: 'tick';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	tickLength?: number | ((d: any) => number);
	styles?: StrokeStyle;
} & CommonMarkerConfigWithColor &
	ClipAwareMarkerConfig;
