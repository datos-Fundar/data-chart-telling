import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/** A waffle chart bar: the value as a grid of unit squares (svelteplot's `WaffleX`/`WaffleY`). */
export type WaffleMarkerConfig = {
	type: 'waffle';
	/** Quantity per square; svelteplot 0.14.2 drops it on the horizontal form. */
	unit?: number;
	multiple?: number;
	gap?: number;
	round?: boolean;
	styles?: AreaStyle;
} & CommonMarkerConfigWithColor &
	CommonMarkerConfigWithInterval;
