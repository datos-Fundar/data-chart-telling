import type { TransformChannel } from '$lib/types/transforms/common';

/** How the nodes of a column are ordered: `'auto'` by where their links pull them, `'input'` as they come. */
export type FlowOrder = 'auto' | 'input';

/** Channels the flow arrangement reads off each link: the rows, the nodes it joins and how much flows along it. */
export type FlowChannels = {
	data?: Record<string, unknown>[];
	/** The id of the node a link leaves. Defaults to the `source` field. */
	source?: TransformChannel;
	/** The id of the node a link reaches. Defaults to the `target` field. */
	target?: TransformChannel;
	/** How much flows along a link, its ribbon's thickness. Defaults to the `value` field. */
	value?: TransformChannel;
};

/** The keys of {@link FlowChannels}, at runtime. */
export const FLOW_CHANNEL_KEYS: Record<keyof FlowChannels, true> = {
	data: true,
	source: true,
	target: true,
	value: true
};

/** Options the flow arrangement takes, flat next to the channels. */
type FlowOptions = {
	/** The nodes, when they carry more than their id. Every node a link names is drawn, listed or not. */
	nodes?: Record<string, unknown>[];
	/** A node's id, as its links name it. Defaults to the `id` field. */
	id?: TransformChannel;
	/**
	 * The column a node stands in, which names it on the x axis. Unset, a node's column is its depth: how
	 * many links lead to it along the longest path from a node nothing flows into.
	 */
	column?: TransformChannel;
	/** The columns in order, left to right; the ones it leaves out follow in the order they appear. */
	columns?: string[];
	/** The room between two nodes of a column, in the links' own units. Defaults to a twentieth of the tallest column. */
	gap?: number;
	/** How the nodes of a column are ordered. Defaults to `'auto'`. */
	order?: FlowOrder;
	/** How many passes move the nodes toward the links that join them. Defaults to `6`. */
	iterations?: number;
};

/**
 * The flow arrangement of a sankey, as the plot's transforms phase runs it: the links of a graph in named columns
 * on x, and on y in their own units, so a node's height is the value through it. Produces a row per node (`x`,
 * `y1`/`y2`) and a row per link (`x1`/`x2`, leaving between `y1`/`y2` and arriving between `y3`/`y4`, as a
 * `ribbon` reads them), told apart by `FLOW_ROW.kind` and carrying what the arrangement knows of them (see
 * `FLOW_ROW`).
 */
export type FlowArrangement = { type: 'flow' } & FlowChannels & FlowOptions;
