import { resolveAccessor } from '$lib/utils/accessors';
import type { GraphNodes } from '$lib/types/plots/data/graph';
import type { Accessor } from '$lib/types/layout/mapping';
import type { FlowColor, FlowEnd } from '$lib/types/plots/families/graph';

type Row = Record<string | symbol, unknown>;

/** A node of a table's graph: a value of one of its columns. */
type TableNode = { id: string; name: string; column: string };

/** A link of a table's graph: the ids of its ends, its summed value, and the `by` fields it kept apart. */
type TableLink = Record<string, unknown> & { source: string; target: string };

/** A graph as its links and how to read them, and its nodes. */
type Links = { links: Row[]; from?: unknown; to?: unknown; value?: unknown; nodes?: GraphNodes };

/**
 * How a graph kind's rows make a graph: links read by `from`, `to` and `value`, with their `nodes`; or, with
 * `columns`, a table whose links stay apart by every field `reads` names (the fields the plot reads off them).
 */
export type FlowGraphOptions = Omit<Links, 'links'> & { columns?: string[]; reads?: unknown[] };

/** What every node row of a {@link FlowGraph} carries, besides its own fields. */
export const GRAPH_NODE = {
	id: Symbol('graph.node.id'),
	label: Symbol('graph.node.label')
} as const;

const read = (accessor: unknown, fallback: string) =>
	resolveAccessor((accessor ?? fallback) as never) as (row: Row) => unknown;

/**
 * A graph kind's rows read once as a graph: every node as a row (the ones given, then the ones only the links name),
 * what each is called, and what a link's `color` is - the label of the node at one of its ends, or a value of
 * its own.
 */
export class FlowGraph {
	readonly source: (link: Row) => unknown;
	readonly target: (link: Row) => unknown;
	readonly value: (link: Row) => unknown;
	/** The links, one row each. */
	readonly links: Row[];
	readonly column: Accessor<Row, unknown> | undefined;
	/** Every node, tagged with its id and label under {@link GRAPH_NODE}. */
	readonly nodes: Row[];
	/** Every node label, once each, in the nodes' order. */
	readonly labels: string[];
	/** The end of a link whose node colors it, when the nodes are the series; `undefined` when a link's own value is. */
	readonly end: FlowEnd | undefined;
	/** A link's `color`: its node's label at {@link end}, or the author's accessor. */
	readonly color: (link: Row) => unknown;
	readonly #labels = new Map<unknown, string>();

	constructor(graph: Links, color: FlowColor<never> | undefined = 'source') {
		this.source = read(graph.from, 'source');
		this.target = read(graph.to, 'target');
		this.value = read(graph.value, 'value');
		this.links = graph.links;
		this.column = graph.nodes?.column as Accessor<Row, unknown> | undefined;
		const idOf = read(graph.nodes?.id, 'id');
		const labelOf = graph.nodes?.label === undefined ? undefined : read(graph.nodes.label, 'name');

		const nodes = new Map<unknown, Row>();
		for (const row of (graph.nodes?.data ?? []) as Row[]) {
			const id = idOf(row);
			if (nodes.has(id)) continue;
			const named = labelOf ? labelOf(row) : (row.name ?? id);
			nodes.set(id, { ...row, [GRAPH_NODE.id]: id, [GRAPH_NODE.label]: String(named) });
		}
		for (const link of graph.links) {
			for (const id of [this.source(link), this.target(link)]) {
				if (id == null || nodes.has(id)) continue;
				nodes.set(id, { [GRAPH_NODE.id]: id, [GRAPH_NODE.label]: String(id) });
			}
		}
		this.nodes = [...nodes.values()];
		for (const node of this.nodes)
			this.#labels.set(node[GRAPH_NODE.id], String(node[GRAPH_NODE.label]));
		this.labels = [...new Set(this.#labels.values())];

		this.end = color === 'source' || color === 'target' ? color : undefined;
		const end = this.end === 'target' ? this.target : this.source;
		this.color = this.end
			? (link) => this.labelOf(end(link))
			: (resolveAccessor(color as never) as (link: Row) => unknown);
	}

	/** A graph kind's rows as a graph: its links, or the table `columns` makes one of (see {@link FlowGraphOptions}). */
	static of(rows: Row[], options: FlowGraphOptions, color?: FlowColor<never>): FlowGraph {
		const { columns, reads = [], ...links } = options;
		if (!columns) return new FlowGraph({ ...links, links: rows }, color);
		const skip = new Set<unknown>([...columns, links.value, 'source', 'target']);
		const by = [
			...new Set(
				reads
					.flat()
					.filter((field): field is string => typeof field === 'string' && !skip.has(field))
			)
		];
		return new FlowGraph(FlowGraph.#fromTable(rows, columns, links.value, by), color);
	}

	/**
	 * The graph of a table's `columns`, left to right: a node per value of each column, and a link between the
	 * values of each two neighbouring columns that share rows, carrying their summed `value` (how many rows they
	 * share, when unset) under the same field (`value` when it is a function). Rows that differ in a `by` field (a
	 * year to slice on) stay apart, and their links keep it.
	 */
	static #fromTable(rows: Row[], columns: string[], value: unknown, by: string[]): Links {
		const valueKey = typeof value === 'string' ? value : 'value';
		const valueOf =
			value === undefined
				? () => 1
				: typeof value === 'function'
					? (value as (row: Row) => number)
					: (row: Row) => Number(row[value as string]);
		const idOf = (column: string, name: unknown) => JSON.stringify([column, String(name)]);

		const nodes = new Map<string, TableNode>();
		for (const column of columns) {
			for (const row of rows) {
				if (row[column] == null) continue;
				const id = idOf(column, row[column]);
				if (!nodes.has(id)) nodes.set(id, { id, name: String(row[column]), column });
			}
		}

		const links = new Map<string, TableLink>();
		for (let i = 0; i < columns.length - 1; i++) {
			const [from, to] = [columns[i], columns[i + 1]];
			for (const row of rows) {
				if (row[from] == null || row[to] == null) continue;
				const source = idOf(from, row[from]);
				const target = idOf(to, row[to]);
				const kept = Object.fromEntries(by.map((field) => [field, row[field]]));
				const key = JSON.stringify([source, target, ...by.map((field) => row[field])]);
				const link =
					links.get(key) ??
					links.set(key, { ...kept, source, target, [valueKey]: 0 } as TableLink).get(key)!;
				link[valueKey] = Number(link[valueKey]) + (Number(valueOf(row)) || 0);
			}
		}

		return {
			links: [...links.values()],
			value: valueKey,
			nodes: { data: [...nodes.values()], column: 'column' }
		};
	}

	/** What the node of `id` is called: its label, else the id itself. */
	labelOf(id: unknown): string {
		return this.#labels.get(id) ?? String(id);
	}
}
