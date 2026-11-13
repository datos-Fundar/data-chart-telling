import type { Accessor } from '$lib/types/layout/mapping';

/**
 * The nodes of a graph kind, when they carry more than the ids its links name: their rows, and how to read them -
 * each accessor a field key or a function of the row.
 */
export type GraphNodes<TNode extends Record<string, unknown> = Record<string, unknown>> = {
	data: TNode[];
	/** A node's id, as its links name it. Defaults to `'id'`. */
	id?: Accessor<TNode, unknown>;
	/** What a node is called, which colors it and names it on the legend. Defaults to its `name` field, else its id. */
	label?: Accessor<TNode, unknown>;
	/** The column a node stands in; unset, its depth along the links. */
	column?: Accessor<TNode, unknown>;
};
