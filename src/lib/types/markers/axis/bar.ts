import type { AxisValue } from '$lib/types/layout/mapping';
import type { AreaStyle, PerRow, InsetStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/** A bar mark; `role` tells a visible segment from the hover hit area and highlight. */
export type BarMarkerConfig = {
	type: 'bar';
	role: 'segment' | 'hitArea' | 'highlight';
	isHorizontal: boolean;
	thickness?: number;
	styles?: PerRow<AreaStyle> & InsetStyle;
	category?: AxisValue;
	hover?: boolean;
} & CommonMarkerConfigWithColor &
	CommonMarkerConfigWithInterval;
