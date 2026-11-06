import type { StrokeStyle, PerRow } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

/** A short tick per row along one axis (svelteplot's `TickX`/`TickY`). */
export type TickMarkerConfig = {
	type: 'tick';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	tickLength?: number | ((d: any) => number);
	styles?: PerRow<StrokeStyle>;
} & CommonMarkerConfigWithColor;
