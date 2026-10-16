import type { AxisValue } from '$lib/types/layout/mapping';
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
	/** A `'hitArea'` that matches `data` as the plot's hover while the pointer is over it. */
	hover?: boolean;
} & CommonMarkerConfigWithColor &
	CommonMarkerConfigWithInterval;
