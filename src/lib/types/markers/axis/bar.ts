import type { AxisValue } from '$lib/types/layout/scales';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/** A bar mark; `role` tells a visible segment from the hover hit area and highlight. */
export type BarMarkerConfig = {
	type: 'bar';
	role: 'segment' | 'hitArea' | 'highlight';
	isHorizontal: boolean;
	insetTop?: number;
	insetBottom?: number;
	insetLeft?: number;
	insetRight?: number;
	styles?: AreaStyle;
	category?: AxisValue;
	onpointerenter?: () => void;
	onpointerleave?: () => void;
} & CommonMarkerConfigWithColor &
	CommonMarkerConfigWithInterval;
