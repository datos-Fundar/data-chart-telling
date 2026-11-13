import { FLOW_CHANNEL_KEYS, type FlowOrder } from '$lib/types/arrangements/flow';
import type { Row, TransformAdapter } from '$lib/types/phases/transforms/adapter';

/** What the flow arrangement leaves on each row it produces, and the channels it reads them back by. */
export const FLOW_ROW = {
	/** `'node'` or `'link'`. */
	kind: Symbol('flow.kind'),
	/** A node's id, or the ids a link joins. */
	node: Symbol('flow.node'),
	source: Symbol('flow.source'),
	target: Symbol('flow.target'),
	/** The value through a node (the most of what reaches it and what leaves it), or along a link. */
	value: Symbol('flow.value'),
	/** A node's links, as the rows the arrangement produces for them. */
	incoming: Symbol('flow.incoming'),
	outgoing: Symbol('flow.outgoing'),
	/** A node's column. */
	x: Symbol('flow.x'),
	/** The columns a link leaves from and arrives at. */
	x1: Symbol('flow.x1'),
	x2: Symbol('flow.x2'),
	/** A node's middle. */
	y: Symbol('flow.y'),
	/** A node's edges, or the edges of a link where it leaves. */
	y1: Symbol('flow.y1'),
	y2: Symbol('flow.y2'),
	/** The edges of a link where it arrives. */
	y3: Symbol('flow.y3'),
	y4: Symbol('flow.y4')
} as const;

type Node = {
	id: unknown;
	row?: Row;
	/** Where it was first named: in `nodes`, then along the links. */
	index: number;
	column: string;
	depth: number;
	incoming: Link[];
	outgoing: Link[];
	value: number;
	y0: number;
	y1: number;
};
type Link = { row: Row; index: number; source: Node; target: Node; value: number };

const DEFAULT_ITERATIONS = 6;
/** The gap between nodes, as a share of the tallest column's values, when none is given. */
const DEFAULT_GAP = 1 / 20;

const read = (channel: unknown, fallback: string): ((row: Row) => unknown) => {
	const own = channel ?? fallback;
	return typeof own === 'function' ? (own as (row: Row) => unknown) : (row) => row[own as string];
};

/** The flow arrangement of a sankey, in the shape every transform returns. */
export class FlowArrangement {
	static readonly adapter: TransformAdapter = {
		channelKeys: FLOW_CHANNEL_KEYS,
		run: (channels, options) => FlowArrangement.place(channels, options)
	};

	/**
	 * A row per node and per link of the graph `channels.data` holds the links of. A link whose value is not a
	 * positive number carries nothing, so it is left out. Nodes stand in named columns, and on y they span the
	 * value through them, stacked with a gap between and moved toward the links that join them.
	 */
	static place(channels: Row, options: Row): Row {
		const { data, source, target, value, ...rest } = channels as {
			data?: Row[];
		} & Row;
		if (!data) throw new Error('flow: missing data');
		const graph = FlowArrangement.#graph(data, { source, target, value }, options);
		const columns = FlowArrangement.#columns(graph.nodes, options.columns as string[] | undefined);
		const order = (options.order as FlowOrder | undefined) ?? 'auto';
		const heaviest = Math.max(
			0,
			...columns.map((column) => column.reduce((sum, node) => sum + node.value, 0))
		);
		const gap = Number.isFinite(Number(options.gap))
			? Math.max(0, Number(options.gap))
			: heaviest * DEFAULT_GAP;
		const height = Math.max(
			0,
			...columns.map(
				(column) => column.reduce((sum, node) => sum + node.value, 0) + gap * (column.length - 1)
			)
		);
		new FlowPlacement(columns, gap, height, order).run(
			Number(options.iterations ?? DEFAULT_ITERATIONS)
		);
		return { ...rest, ...FlowArrangement.#rows(graph) };
	}

	/** The nodes and links of the graph: the nodes listed first, then the ones the links name. */
	static #graph(data: Row[], links: Row, options: Row): { nodes: Node[]; links: Link[] } {
		const idOf = read(options.id, 'id');
		const columnOf = options.column === undefined ? undefined : read(options.column, '');
		const nodes = new Map<unknown, Node>();
		const nodeOf = (id: unknown, row?: Row): Node => {
			let node = nodes.get(id);
			if (!node) {
				node = {
					id,
					index: nodes.size,
					column: '',
					depth: 0,
					incoming: [],
					outgoing: [],
					value: 0,
					y0: 0,
					y1: 0
				};
				nodes.set(id, node);
			}
			if (row && !node.row) node.row = row;
			return node;
		};
		for (const row of (options.nodes as Row[] | undefined) ?? []) nodeOf(idOf(row), row);

		const sourceOf = read(links.source, 'source');
		const targetOf = read(links.target, 'target');
		const valueOf = read(links.value, 'value');
		const edges: Link[] = [];
		data.forEach((row, index) => {
			const value = Number(valueOf(row));
			const [from, to] = [sourceOf(row), targetOf(row)];
			if (!(Number.isFinite(value) && value > 0) || from == null || to == null) return;
			const link: Link = { row, index, source: nodeOf(from), target: nodeOf(to), value };
			link.source.outgoing.push(link);
			link.target.incoming.push(link);
			edges.push(link);
		});

		const all = [...nodes.values()];
		for (const node of all) {
			const sum = (links: Link[]) => links.reduce((total, link) => total + link.value, 0);
			node.value = Math.max(sum(node.incoming), sum(node.outgoing));
		}
		FlowArrangement.#depths(all);
		for (const node of all) {
			const named = columnOf && node.row ? columnOf(node.row) : undefined;
			node.column = named == null ? String(node.depth) : String(named);
		}
		return { nodes: all.filter((node) => node.value > 0), links: edges };
	}

	/** Each node's depth: the most links along a path to it from a node nothing flows into. A cycle stops growing it. */
	static #depths(nodes: Node[]): void {
		let current = new Set(nodes.filter((node) => node.incoming.length === 0));
		if (current.size === 0) current = new Set(nodes);
		for (let depth = 0; current.size && depth <= nodes.length; depth++) {
			const next = new Set<Node>();
			for (const node of current) {
				node.depth = depth;
				for (const link of node.outgoing) next.add(link.target);
			}
			current = next;
		}
	}

	/** The nodes by column, the columns in `order` and then by their shallowest node, each in the nodes' own order. */
	static #columns(nodes: Node[], order: string[] = []): Node[][] {
		const byColumn = new Map<string, Node[]>();
		for (const node of nodes) {
			const column = byColumn.get(node.column) ?? byColumn.set(node.column, []).get(node.column)!;
			column.push(node);
		}
		const rank = (name: string) => {
			const listed = order.indexOf(name);
			return listed >= 0
				? listed - order.length
				: Math.min(...byColumn.get(name)!.map((n) => n.depth));
		};
		return [...byColumn.keys()]
			.map((name, appearance) => ({ name, appearance, rank: rank(name) }))
			.sort((a, b) => a.rank - b.rank || a.appearance - b.appearance)
			.map(({ name }) => byColumn.get(name)!);
	}

	/** The rows of the laid-out graph, and the channels that read them. */
	static #rows({ nodes, links }: { nodes: Node[]; links: Link[] }): Row {
		const linkRows = new Map<Link, Row>();
		for (const link of links) {
			const leaving = FlowPlacement.offset(link, 'outgoing');
			const arriving = FlowPlacement.offset(link, 'incoming');
			linkRows.set(link, {
				...link.row,
				[FLOW_ROW.kind]: 'link',
				[FLOW_ROW.source]: link.source.id,
				[FLOW_ROW.target]: link.target.id,
				[FLOW_ROW.value]: link.value,
				[FLOW_ROW.x1]: link.source.column,
				[FLOW_ROW.x2]: link.target.column,
				[FLOW_ROW.y1]: link.source.y0 + leaving,
				[FLOW_ROW.y2]: link.source.y0 + leaving + link.value,
				[FLOW_ROW.y3]: link.target.y0 + arriving,
				[FLOW_ROW.y4]: link.target.y0 + arriving + link.value
			});
		}
		const nodeRows = nodes.map(
			(node): Row => ({
				...node.row,
				[FLOW_ROW.kind]: 'node',
				[FLOW_ROW.node]: node.id,
				[FLOW_ROW.value]: node.value,
				[FLOW_ROW.incoming]: node.incoming.map((link) => linkRows.get(link)),
				[FLOW_ROW.outgoing]: node.outgoing.map((link) => linkRows.get(link)),
				[FLOW_ROW.x]: node.column,
				[FLOW_ROW.y]: (node.y0 + node.y1) / 2,
				[FLOW_ROW.y1]: node.y0,
				[FLOW_ROW.y2]: node.y1
			})
		);
		return {
			data: [...nodeRows, ...linkRows.values()],
			x: FLOW_ROW.x,
			y: FLOW_ROW.y,
			x1: FLOW_ROW.x1,
			x2: FLOW_ROW.x2,
			y1: FLOW_ROW.y1,
			y2: FLOW_ROW.y2,
			y3: FLOW_ROW.y3,
			y4: FLOW_ROW.y4
		};
	}
}

/**
 * Where the nodes of a sankey sit on y, column by column: stacked with `gap` between them, then moved toward the
 * nodes they are linked to over a few passes (after d3-sankey's), never overlapping and never leaving `[0, height]`.
 */
class FlowPlacement {
	readonly #columns: Node[][];
	readonly #gap: number;
	readonly #height: number;
	readonly #order: FlowOrder;
	readonly #position = new Map<Node, number>();
	/** The least move worth making, for numbers in the links' own units. */
	readonly #epsilon: number;

	constructor(columns: Node[][], gap: number, height: number, order: FlowOrder) {
		this.#columns = columns;
		this.#gap = gap;
		this.#height = height;
		this.#order = order;
		this.#epsilon = height * 1e-9;
		columns.forEach((column, index) => column.forEach((node) => this.#position.set(node, index)));
	}

	/** How far down its node a link starts, past the links before it on that side. */
	static offset(link: Link, side: 'incoming' | 'outgoing'): number {
		const node = side === 'outgoing' ? link.source : link.target;
		let offset = 0;
		for (const other of node[side]) {
			if (other === link) break;
			offset += other.value;
		}
		return offset;
	}

	run(iterations: number): void {
		for (const column of this.#columns) {
			const total =
				column.reduce((sum, node) => sum + node.value, 0) + this.#gap * (column.length - 1);
			let y = (this.#height - total) / 2;
			for (const node of column) {
				node.y0 = y;
				node.y1 = y + node.value;
				y = node.y1 + this.#gap;
			}
		}
		this.#sortLinks();
		for (let i = 0; i < iterations; i++) {
			const alpha = Math.pow(0.99, i);
			const beta = Math.max(1 - alpha, (i + 1) / iterations);
			this.#relax('backward', alpha, beta);
			this.#relax('forward', alpha, beta);
		}
	}

	/**
	 * Moves each node toward where its links would run straight, weighted by their values and by how many columns
	 * they cross: `'forward'` follows the links that reach it, column by column from the left, `'backward'` the
	 * links that leave it, from the right.
	 */
	#relax(direction: 'forward' | 'backward', alpha: number, beta: number): void {
		const columns =
			direction === 'forward' ? this.#columns.slice(1) : this.#columns.slice(0, -1).reverse();
		for (const column of columns) {
			for (const node of column) {
				const links = direction === 'forward' ? node.incoming : node.outgoing;
				let sum = 0;
				let weight = 0;
				for (const link of links) {
					const span = Math.abs(
						this.#position.get(link.target)! - this.#position.get(link.source)!
					);
					const w = link.value * Math.max(1, span);
					sum += this.#straight(link, direction) * w;
					weight += w;
				}
				if (weight > 0) {
					const dy = (sum / weight - node.y0) * alpha;
					node.y0 += dy;
					node.y1 += dy;
				}
			}
			if (this.#order === 'auto') column.sort((a, b) => a.y0 - b.y0 || a.index - b.index);
			this.#resolveCollisions(column, beta);
			this.#sortLinks();
		}
	}

	/** Where the top of the node `direction` moves would sit for `link` to run straight. */
	#straight(link: Link, direction: 'forward' | 'backward'): number {
		const leaving = FlowPlacement.offset(link, 'outgoing');
		const arriving = FlowPlacement.offset(link, 'incoming');
		return direction === 'forward'
			? link.source.y0 + leaving - arriving
			: link.target.y0 + arriving - leaving;
	}

	/** Pushes overlapping nodes apart from the middle one out, then back inside `[0, height]`. */
	#resolveCollisions(column: Node[], alpha: number): void {
		const middle = column.length >> 1;
		const subject = column[middle];
		if (!subject) return;
		this.#upward(column, subject.y0 - this.#gap, middle - 1, alpha);
		this.#downward(column, subject.y1 + this.#gap, middle + 1, alpha);
		this.#upward(column, this.#height, column.length - 1, alpha);
		this.#downward(column, 0, 0, alpha);
	}

	/** Pushes nodes down from the `i`-th on, so each starts at or below `y`. */
	#downward(column: Node[], y: number, i: number, alpha: number): void {
		for (; i < column.length; i++) {
			const node = column[i];
			const dy = (y - node.y0) * alpha;
			if (dy > this.#epsilon) {
				node.y0 += dy;
				node.y1 += dy;
			}
			y = node.y1 + this.#gap;
		}
	}

	/** Pushes nodes up from the `i`-th back, so each ends at or above `y`. */
	#upward(column: Node[], y: number, i: number, alpha: number): void {
		for (; i >= 0; i--) {
			const node = column[i];
			const dy = (node.y1 - y) * alpha;
			if (dy > this.#epsilon) {
				node.y0 -= dy;
				node.y1 -= dy;
			}
			y = node.y0 - this.#gap;
		}
	}

	/** Each node's links in the order of the nodes at their other end, top to bottom, so they do not cross at it. */
	#sortLinks(): void {
		for (const column of this.#columns) {
			for (const node of column) {
				node.outgoing.sort((a, b) => a.target.y0 - b.target.y0 || a.index - b.index);
				node.incoming.sort((a, b) => a.source.y0 - b.source.y0 || a.index - b.index);
			}
		}
	}
}
