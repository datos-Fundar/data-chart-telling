import { describe, expect, test } from 'vitest';
import { Transforms } from '$lib/phases/transforms/Transforms';
import { FLOW_ROW } from '$lib/plots/families/graph/arrangements/FlowArrangement';
import { FlowGraph, GRAPH_NODE } from '$lib/plots/families/graph/FlowGraph';
import type { Transform } from '$lib/types/phases';

type Row = Record<string | symbol, unknown>;
type Table = {
	links: (Row & { source: string; target: string })[];
	nodes: { id: string; name: string; column: string }[];
	value: string;
	column: string;
};

const ROWS = [
	{ work: 'CABA', home: 'CABA', year: 2003, n: 10 },
	{ work: 'CABA', home: 'GBA', year: 2003, n: 4 },
	{ work: 'GBA', home: 'GBA', year: 2003, n: 8 },
	{ work: 'CABA', home: 'GBA', year: 2025, n: 6 },
	{ work: 'CABA', home: 'GBA', year: 2025, n: 1 }
];

/** The graph of the table's two columns, as `FlowGraph.of` reads it: its links, and its nodes as given. */
const tableOf = (options: { value?: string; reads?: unknown[] }): Table => {
	const graph = FlowGraph.of(ROWS, { columns: ['work', 'home'], ...options });
	const nodes = graph.nodes.map(({ id, name, column }) => ({ id, name, column }));
	return {
		links: graph.links as Table['links'],
		nodes: nodes as Table['nodes'],
		value: options.value ?? 'value',
		column: 'column'
	};
};

describe('FlowGraph.of - a table', () => {
	test('makes a node per value of each column, named after it', () => {
		const graph = tableOf({ value: 'n' });
		expect(graph.nodes.map(({ name, column }) => `${column}:${name}`)).toEqual([
			'work:CABA',
			'work:GBA',
			'home:CABA',
			'home:GBA'
		]);
		expect(graph.column).toBe('column');
	});

	test('sums the value of the rows two neighbouring columns share into one link, under its field', () => {
		const graph = tableOf({ value: 'n' });
		const named = (id: string) => graph.nodes.find((node) => node.id === id)!.name;
		const sums = graph.links.map((link) => `${named(link.source)}>${named(link.target)}=${link.n}`);
		expect(sums).toEqual(['CABA>CABA=10', 'CABA>GBA=11', 'GBA>GBA=8']);
		expect(graph.value).toBe('n');
	});

	test('counts the rows without a value, and keeps rows apart by the fields the plot reads', () => {
		const graph = tableOf({ reads: [undefined, ['year'], 'work'] });
		expect(graph.links.map((link) => [link.year, link.value])).toEqual([
			[2003, 1],
			[2003, 1],
			[2003, 1],
			[2025, 2]
		]);
	});

	test('is placed by the flow arrangement as it comes', () => {
		const graph = tableOf({ value: 'n' });
		const out = Transforms.run(
			{ type: 'flow', nodes: graph.nodes, column: graph.column, value: graph.value } as Transform,
			{ data: graph.links }
		) as { data: Row[] };
		const nodes = out.data.filter((row) => row[FLOW_ROW.kind] === 'node');
		expect(nodes.map((row) => row[FLOW_ROW.x])).toEqual(['work', 'work', 'home', 'home']);
	});

	test('takes links as they are, without columns', () => {
		const links = [{ source: 'a', target: 'b', value: 1, year: 2003 }];
		expect(FlowGraph.of(links, { reads: ['year'] }).links).toBe(links);
	});
});

describe('FlowGraph', () => {
	const LINKS = [
		{ source: 'a', target: 'b', value: 3, kind: 'x' },
		{ source: 'a', target: 'c', value: 2, kind: 'y' }
	];

	test('takes every id the links name as a node, after the listed ones, labelled by its name or its id', () => {
		const graph = FlowGraph.of(LINKS, { nodes: { data: [{ id: 'c', name: 'Sea' }] } });
		expect(graph.nodes.map((node) => node[GRAPH_NODE.id])).toEqual(['c', 'a', 'b']);
		expect(graph.labels).toEqual(['Sea', 'a', 'b']);
		expect(graph.labelOf('c')).toBe('Sea');
	});

	test("colors a link by the label of its source, its target's, or a value of its own", () => {
		const options = { nodes: { data: [{ id: 'b', name: 'Bay' }] } };
		expect(FlowGraph.of(LINKS, options).color(LINKS[0])).toBe('a');
		expect(FlowGraph.of(LINKS, options, 'target').color(LINKS[0])).toBe('Bay');
		const own = FlowGraph.of(LINKS, options, 'kind' as never);
		expect(own.end).toBeUndefined();
		expect(own.color(LINKS[1])).toBe('y');
	});
});
