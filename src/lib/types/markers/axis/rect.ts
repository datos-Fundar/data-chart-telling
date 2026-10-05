import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithArea } from '$lib/types/markers/channels/commonMarkerConfigWithArea';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/** An arbitrary rectangle (svelteplot's `Rect`); `interval` turns `x`/`y` into ranges. */
export type RectMarkerConfig = {
	type: 'rect';
	interval?: number | string;
	styles?: AreaStyle;
} & CommonMarkerConfigWithArea &
	CommonMarkerConfigWithColor &
	CommonMarkerConfigWithInterval;
