import type { AreaStyle, PerRow, InsetStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithArea } from '$lib/types/markers/channels/commonMarkerConfigWithArea';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithLabel } from '$lib/types/markers/channels/commonMarkerConfigWithLabel';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/** An arbitrary rectangle (svelteplot's `Rect`); `interval` turns `x`/`y` into ranges. */
export type RectMarkerConfig = {
	type: 'rect';
	interval?: number | string;
	/** Makes the rectangle a hit area of the plot's hover: the pointer entering it hovers its `data` rows, as it does for a bar's band. */
	hover?: boolean;
	styles?: PerRow<AreaStyle & InsetStyle>;
} & CommonMarkerConfigWithArea &
	CommonMarkerConfigWithColor &
	CommonMarkerConfigWithInterval &
	CommonMarkerConfigWithLabel;
