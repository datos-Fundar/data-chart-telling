import type { GraphData } from '$lib/types/plots/data/graph';

type Row = Record<string, unknown>;

/** A node {@link Graph.fromTable} makes: a value of one of the table's columns. */
export type TableNode = { id: string; name: string; column: string };

/** A link {@link Graph.fromTable} makes, with the `by` fields it kept apart. */
export type TableLink = Row & { source: string; target: string; value: number };

/** Graphs built from other shapes of data. */
export class Graph {
	/**
	 * The graph of a table's `columns`, left to right: a node per value of each column, and a link between the
	 * values of each two neighbouring columns that share rows, carrying their summed `value` (how many rows they
	 * share, when unset). Rows that differ in a `by` field (a year to slice on) stay apart, and their links keep it.
	 */
	static fromTable<TRow extends Row>(
		rows: readonly TRow[],
		options: {
			columns: (keyof TRow & string)[];
			value?: keyof TRow | ((row: TRow) => number);
			by?: (keyof TRow & string)[];
		}
	): GraphData<TableLink, TableNode> {
		const { columns, value, by = [] } = options;
		const valueOf =
			value === undefined
				? () => 1
				: typeof value === 'function'
					? value
					: (row: TRow) => Number(row[value]);
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
					links.get(key) ?? links.set(key, { ...kept, source, target, value: 0 }).get(key)!;
				link.value += Number(valueOf(row)) || 0;
			}
		}

		return { links: [...links.values()], nodes: [...nodes.values()], column: 'column' };
	}
}
