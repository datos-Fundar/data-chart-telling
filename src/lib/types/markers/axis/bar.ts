import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type {
	PathLabelConfig,
	PageEdge,
	PlotEdge,
	ValueEdge,
	ShapeSide
} from '$lib/types/markers/labels/path';
import type { BoxLabelConfig } from '$lib/types/markers/labels/box';
import type { PointLabelConfig } from '$lib/types/markers/labels/point';
import type { CommonMarkerConfigWithOrientation } from '$lib/types/markers/channels/commonMarkerConfigWithOrientation';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { AreaStyle, PerRow, InsetStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithLabel } from '$lib/types/markers/channels/commonMarkerConfigWithLabel';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/** A bar mark; `role` tells a visible segment from the hover hit area. */
export type BarMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'bar';
	role: 'segment' | 'hitArea';
	thickness?: number;
	styles?: PerRow<AreaStyle, TContext> & InsetStyle;
	category?: AxisValue;
} & CommonMarkerConfigWithOrientation &
	CommonMarkerConfigWithColor<TContext> &
	CommonMarkerConfigWithInterval<TContext> &
	CommonMarkerConfigWithLabel<
		| BoxLabelConfig<TContext>
		| PathLabelConfig<PageEdge | PlotEdge | ValueEdge, ShapeSide, TContext>
		| PointLabelConfig<TContext>
	>;
