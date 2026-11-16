import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { PathLabelConfig, PageEdge, ShapeSide } from '$lib/types/markers/labels/path';
import type { BoxLabelConfig } from '$lib/types/markers/labels/box';
import type { PointLabelConfig } from '$lib/types/markers/labels/point';
import type { AreaStyle, PerRow, InsetStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithArea } from '$lib/types/markers/channels/commonMarkerConfigWithArea';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithLabel } from '$lib/types/markers/channels/commonMarkerConfigWithLabel';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/** An arbitrary rectangle (svelteplot's `Rect`); `interval` turns `x`/`y` into ranges. */
export type RectMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'rect';
	interval?: number | string;
	styles?: PerRow<AreaStyle & InsetStyle, TContext>;
} & CommonMarkerConfigWithArea<TContext> &
	CommonMarkerConfigWithColor<TContext> &
	CommonMarkerConfigWithInterval<TContext> &
	CommonMarkerConfigWithLabel<
		| BoxLabelConfig<TContext>
		| PathLabelConfig<PageEdge, ShapeSide, TContext>
		| PointLabelConfig<TContext>
	>;
