import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { PathLabelConfig, PageEdge, ShapeSide } from '$lib/types/markers/labels/path';
import type { BoxLabelConfig } from '$lib/types/markers/labels/box';
import type { PointLabelConfig } from '$lib/types/markers/labels/point';
import type { AreaStyle, PerRow, InsetStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithArea } from '$lib/types/markers/channels/commonMarkerConfigWithArea';
import type { CommonMarkerConfigWithLabel } from '$lib/types/markers/channels/commonMarkerConfigWithLabel';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

/** A heatmap cell mark; its `fill` is set per row, by `color` or `styles.fill`. */
export type CellMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'cell';
	styles?: PerRow<AreaStyle & Pick<InsetStyle, 'inset'>, TContext>;
} & CommonMarkerConfigWithColor<TContext> &
	CommonMarkerConfigWithArea<TContext> &
	CommonMarkerConfigWithLabel<
		| BoxLabelConfig<TContext>
		| PathLabelConfig<PageEdge, ShapeSide, TContext>
		| PointLabelConfig<TContext>
	>;
