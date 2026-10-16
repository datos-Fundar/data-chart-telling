import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithArea } from '$lib/types/markers/channels/commonMarkerConfigWithArea';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/** An arbitrary rectangle (svelteplot's `Rect`); `interval` turns `x`/`y` into ranges. */
export type RectMarkerConfig = {
	type: 'rect';
	interval?: number | string;
	/** Pixels taken off each side of every rectangle; a bin's default `0.5` on each side leaves a hairline gap. */
	insetLeft?: number;
	insetRight?: number;
	insetTop?: number;
	insetBottom?: number;
	styles?: AreaStyle;
} & CommonMarkerConfigWithArea &
	CommonMarkerConfigWithColor &
	CommonMarkerConfigWithInterval;
