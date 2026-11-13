import type { Accessor } from '$lib/types/layout/mapping';

/**
 * A graph as a graph kind's `data`: its links, the nodes when they carry more than an id, and how to read both -
 * each accessor a field key or a function of the row.
 */
export type GraphData<
	TLink extends Record<string, unknown> = Record<string, unknown>,
	TNode extends Record<string, unknown> = Record<string, unknown>
> = {
	links: TLink[];
	/** Unset, the nodes are the ids the links name. */
	nodes?: TNode[];
	/** The id of the node a link leaves. Defaults to `'source'`. */
	source?: Accessor<TLink, unknown>;
	/** The id of the node a link reaches. Defaults to `'target'`. */
	target?: Accessor<TLink, unknown>;
	/** How much flows along a link. Defaults to `'value'`. */
	value?: Accessor<TLink, number>;
	/** A node's id. Defaults to `'id'`. */
	id?: Accessor<TNode, unknown>;
	/** The column a node stands in; unset, its depth along the links. */
	column?: Accessor<TNode, unknown>;
};
