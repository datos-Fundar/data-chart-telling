import type { SankeyStylesConfig } from '$lib/types/layout/styles/sankey';
import type { GraphNodes } from '$lib/types/plots/data/graph';
import type {
	FlowColor,
	FlowEnd,
	GraphPlotProps,
	GraphPlotCoreProps
} from '$lib/types/plots/families/graph';
import type { Accessor, AxisChannelName, ChannelAccessors } from '$lib/types/layout/mapping';
import type { KindRowContext } from '$lib/types/layout/context';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';

/** One end of a link: a column on x and a value on y, as a marker's `x` and `y` read them. */
export type SankeyLinkEnd = { column: string; y: number };

/**
 * What a `SankeyPlot` knows of a node or a link, which its tooltip's and value labels' `format`, its hover and
 * `usePlot().contextOf` read: its series, and what the plot works out for it. Its `value` is what flows through
 * the node (the most of what reaches it and what leaves it), or along the link.
 */
export type SankeyRowContext = KindRowContext<{
	kind: 'node' | 'link';
	/** A node's label, or the labels of a link's ends. */
	name: string;
	/** The label of the node a link leaves; a node's own. */
	source: string;
	/** The label of the node a link reaches; a node's own. */
	target: string;
	/** The column a node stands in; the one a link leaves. */
	column: string;
	/** A node's part of its column, from `0` to `100`. */
	share?: number;
	/** A link's part of what flows through the node it leaves, from `0` to `100`. */
	sourceShare?: number;
	/** A link's part of what flows through the node it reaches, from `0` to `100`. */
	targetShare?: number;
	/** Where a link leaves: the column of its source, and the middle of the link there, in the links' units. */
	start?: SankeyLinkEnd;
	/** Where a link arrives: the column of its target, and the middle of the link there. */
	end?: SankeyLinkEnd;
	/** The links that reach a node, as what the plot knows of each; a link has none. */
	incoming: SankeyRowContext[];
	/** The links that leave a node, as what the plot knows of each; a link has none. */
	outgoing: SankeyRowContext[];
}>;

/** What a `SankeyPlot`'s `tooltip.format` gets in its third argument - see {@link SankeyRowContext}. */
export type SankeyTooltipContext = SankeyRowContext;

/** The channels `SankeyPlot` takes none of: its rows are placed by its graph. */
type NoChannels<TRow extends Record<string, unknown>> = {
	[K in
		| Exclude<keyof ChannelAccessors<TRow>, 'color' | 'opacity' | 'grouping' | 'value'>
		| AxisChannelName]?: never;
};

/**
 * `SankeyPlot`'s data as links: a row each, naming the node it leaves (`from`, the `source` field by default)
 * and the node it reaches (`to`, `target`), and how much flows along it (`value`). Every id they name is a node;
 * `nodes` gives the ones that carry more than an id. `color` is what the legend lists: the nodes' labels
 * (`'source'`, the default, or `'target'`) or a value of the links'; `opacity` fades the links by one of theirs.
 */
export type SankeyLinksDataProps<
	TLink extends Record<string, unknown>,
	TNode extends Record<string, unknown>
> = {
	data: TLink[];
	series?: never;
	from?: Accessor<TLink, unknown>;
	to?: Accessor<TLink, unknown>;
	value?: Accessor<TLink, number>;
	nodes?: GraphNodes<TNode>;
	columns?: never;
	grouping?: never;
	color?: FlowColor<TLink>;
	opacity?: Accessor<TLink, number>;
} & NoChannels<TLink>;

/**
 * `SankeyPlot`'s data as a table: a node per value of each of its `columns`, left to right, and a link between
 * the values of each two neighbouring columns that share rows, carrying their summed `value` (how many rows they
 * share, when unset) under the same field. The links stay apart by every field the plot reads off them -
 * `color`, `opacity`, `grouping` and its facet's - and keep it, so those read the links as they would the rows.
 * `grouping` keeps them apart without coloring them.
 */
export type SankeyTableDataProps<TRow extends Record<string, unknown>> = {
	data: TRow[];
	series?: never;
	columns: (keyof TRow & string)[];
	value?: (keyof TRow & string) | ((row: TRow) => number);
	grouping?: (keyof TRow & string) | (keyof TRow & string)[];
	from?: never;
	to?: never;
	nodes?: never;
	color?: FlowEnd | (keyof TRow & string) | ((link: Record<string, unknown>) => unknown);
	opacity?: (keyof TRow & string) | ((link: Record<string, unknown>) => number);
} & NoChannels<TRow>;

/** `SankeyPlot`'s data: its links, or a table it makes them of. Its rows are what a timeline or a facet slices. */
export type SankeyDataProps<
	TRow extends Record<string, unknown>,
	TNode extends Record<string, unknown>
> = SankeyLinksDataProps<TRow, TNode> | SankeyTableDataProps<TRow>;

/** `SankeyPlot`'s public props: a graph of links between nodes standing in columns. */
export type SankeyPlotProps<
	TLink extends Record<string, unknown>,
	TNode extends Record<string, unknown> = Record<string, unknown>
> = GraphPlotProps<
	SankeyDataProps<TLink, TNode>,
	TLink,
	SankeyStylesConfig,
	BarSegmentStyle,
	SankeyTooltipContext
>;

/** What `SankeyPlot`'s core draws from. */
export type SankeyPlotCoreProps<
	TRow extends Record<string, unknown>,
	TNode extends Record<string, unknown> = Record<string, unknown>
> = GraphPlotCoreProps<SankeyDataProps<TRow, TNode>, TRow, SankeyStylesConfig, BarSegmentStyle>;
