import type { AreaStyle, PerRow, InsetStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithArea } from '$lib/types/markers/channels/commonMarkerConfigWithArea';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/** An arbitrary rectangle (svelteplot's `Rect`); `interval` turns `x`/`y` into ranges. */
export type RectMarkerConfig = {
	type: 'rect';
	interval?: number | string;
	styles?: PerRow<AreaStyle & InsetStyle>;
} & CommonMarkerConfigWithArea &
	CommonMarkerConfigWithColor &
	CommonMarkerConfigWithInterval;
