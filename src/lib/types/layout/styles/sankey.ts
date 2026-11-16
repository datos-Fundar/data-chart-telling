import type { WithValues } from '$lib/types/layout/styles/values';
import type { ArrangementAwarePlotStylesConfig } from '$lib/types/layout/styles/arrangement';
import type { PointLabelConfig } from '$lib/types/markers/labels/point';
import type { FlowArrangementOptions } from '$lib/types/arrangements/flow';
import type { FlowEnd } from '$lib/types/plots/families/graph';
import type { StyleValue } from '$lib/types/layout/styles/base';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { SankeyRowContext } from '$lib/types/plots/flow/sankey/props';

/**
 * The nodes of a sankey: an area's style, its `fill` over its series' color, and its size. `width` and `padding`
 * fall back to `sankey.nodes` in the configuration.
 */
type SankeyNodeStyle = AreaStyle & {
	/** A node's width, in px. */
	width?: number;
	/** The room between two nodes of a column, in px. */
	padding?: number;
};

/**
 * The links of a sankey: an area's style, with a `fill` of their own and how they bend.
 * `fillOpacity` and `curvature` fall back to `sankey.links` in the configuration.
 */
type SankeyLinkStyle = Omit<AreaStyle, 'fill'> & {
	/**
	 * A link's fill: the color of the node at one of its ends (`'source'`, the default, or `'target'`) while the
	 * nodes are the series, or a color of its own; or a function of what the plot knows of the link that says which, so
	 * the links of each column can take a different end (`(link) => link.column === 'island' ? 'target' : 'source'`).
	 */
	fill?: StyleValue<FlowEnd | (string & {}), SankeyRowContext>;
	/** How far in from each end (0-1) a link's edges bend: `0.5` meets at the middle, `0` is a straight band. */
	curvature?: number;
};

/**
 * Where a node's label sits: `'auto'` beside it, toward the middle of the plot (right of every column but the
 * last, left of the last); `'outside'` past the plot's edges for the first and last columns, so the room between
 * the columns is left to the links.
 */
type SankeyValuesPosition = 'auto' | 'outside';

/** `SankeyPlot`'s `styles`: its nodes, its links, its node labels, and how its nodes are arranged. */
export type SankeyStylesConfig = WithValues<
	ArrangementAwarePlotStylesConfig<FlowArrangementOptions>,
	PointLabelConfig,
	'value',
	SankeyRowContext
> & {
	nodes?: SankeyNodeStyle;
	links?: SankeyLinkStyle;
	values?: { position?: SankeyValuesPosition };
};
