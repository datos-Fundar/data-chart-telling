import type { PathLabelConfig, PageEdge, ValueEdge } from '$lib/types/markers/labels/path';
import type { BoxLabelConfig } from '$lib/types/markers/labels/box';
import type { PointLabelConfig } from '$lib/types/markers/labels/point';
import type { CommonMarkerConfigWithOrientation } from '$lib/types/markers/channels/commonMarkerConfigWithOrientation';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { AreaStyle, PerRow, InsetStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithLabel } from '$lib/types/markers/channels/commonMarkerConfigWithLabel';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/** A bar mark; `role` tells a visible segment from the hover hit area. */
export type BarMarkerConfig = {
	type: 'bar';
	role: 'segment' | 'hitArea';
	thickness?: number;
	styles?: PerRow<AreaStyle> & InsetStyle;
	category?: AxisValue;
} & CommonMarkerConfigWithOrientation &
	CommonMarkerConfigWithColor &
	CommonMarkerConfigWithInterval &
	CommonMarkerConfigWithLabel<
		BoxLabelConfig | PathLabelConfig<PageEdge | ValueEdge> | PointLabelConfig
	>;
