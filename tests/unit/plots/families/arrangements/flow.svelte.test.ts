import { describe, expect, test } from 'vitest';
import { Transforms } from '$lib/phases/transforms/Transforms';
import { FLOW_ROW } from '$lib/plots/families/graph/arrangements/FlowArrangement';
import { Graph } from '$lib/plots/families/graph/Graph';
import type { Transform } from '$lib/types/phases';
import type { FlowArrangement } from '$lib/types/arrangements/flow';

type Row = Record<string | symbol, unknown>;
type Out = { data: Row[]; [key: string]: unknown };

const LINKS: Row[] = [
	{ source: 'A', target: 'C', value: 5 },
	{ source: 'A', target: 'D', value: 3 },
	{ source: 'B', target: 'C', value: 2 },
	{ source: 'B', target: 'D', value: 4 },
	{ source: 'C', target: 'E', value: 7 },
	{ source: 'D', target: 'E', value: 7 }
];

const run = (transform: Omit<FlowArrangement, 'type'> = {}, data = LINKS) =>
	Transforms.run({ type: 'flow', ...transform } as Transform, { data }) as Out;

const nodes = (out: Out) => out.data.filter((row) => row[FLOW_ROW.kind] === 'node');
const links = (out: Out) => out.data.filter((row) => row[FLOW_ROW.kind] === 'link');
const node = (out: Out, id: unknown) => nodes(out).find((row) => row[FLOW_ROW.node] === id)!;
const num = (row: Row, key: keyof typeof FLOW_ROW) => Number(row[FLOW_ROW[key]]);

/** The nodes of a column, top to bottom. */
const column = (out: Out, name: string) =>
	nodes(out)
		.filter((row) => row[FLOW_ROW.x] === name)
		.sort((a, b) => num(a, 'y1') - num(b, 'y1'));

describe('flow arrangement', () => {
	test('makes a row per node and per link, and names the channels that read them', () => {
		const out = run();
		expect(nodes(out)).toHaveLength(5);
		expect(links(out)).toHaveLength(6);
		for (const key of ['x', 'y', 'x1', 'x2', 'y1', 'y2', 'y3', 'y4'] as const)
			expect(out[key]).toBe(FLOW_ROW[key]);
	});

	test("a node's value is the most of what reaches it and what leaves it, and its height", () => {
		const out = run();
		const values = { A: 8, B: 6, C: 7, D: 7, E: 14 };
		for (const [id, value] of Object.entries(values)) {
			const row = node(out, id);
			expect(num(row, 'value')).toBe(value);
			expect(num(row, 'y2') - num(row, 'y1')).toBeCloseTo(value, 6);
		}
	});

	test('puts each node in the column of its depth when no column is given', () => {
		const out = run();
		expect(column(out, '0').map((row) => row[FLOW_ROW.node])).toEqual(
			expect.arrayContaining(['A', 'B'])
		);
		expect(column(out, '1')).toHaveLength(2);
		expect(column(out, '2').map((row) => row[FLOW_ROW.node])).toEqual(['E']);
	});

	test('keeps the gap between the nodes of a column, all of them within the tallest column', () => {
		const gap = 1;
		const out = run({ gap });
		// The middle column: 7 + 7 and a gap.
		const height = 15;
		for (const name of ['0', '1', '2']) {
			const rows = column(out, name);
			for (let i = 1; i < rows.length; i++)
				expect(num(rows[i], 'y1') - num(rows[i - 1], 'y2')).toBeGreaterThanOrEqual(gap - 1e-9);
			expect(num(rows[0], 'y1')).toBeGreaterThanOrEqual(-1e-9);
			expect(num(rows[rows.length - 1], 'y2')).toBeLessThanOrEqual(height + 1e-9);
		}
	});

	test("stacks a node's links over it, as thick as their values, in the order of their other ends", () => {
		const out = run();
		for (const row of nodes(out)) {
			for (const [side, from, to, other] of [
				['outgoing', 'y1', 'y2', 'y3'],
				['incoming', 'y3', 'y4', 'y1']
			] as const) {
				const own = row[FLOW_ROW[side]] as Row[];
				if (!own.length) continue;
				let y = num(row, 'y1');
				for (const link of own) {
					expect(num(link, from)).toBeCloseTo(y, 6);
					expect(num(link, to) - num(link, from)).toBeCloseTo(num(link, 'value'), 6);
					y = num(link, to);
				}
				const ends = own.map((link) => num(link, other));
				expect(ends).toEqual([...ends].sort((a, b) => a - b));
			}
		}
	});

	test('a link leaves from the column of its source and arrives at the column of its target', () => {
		const out = run();
		const link = links(out).find((row) => row.source === 'C')!;
		expect(link[FLOW_ROW.x1]).toBe('1');
		expect(link[FLOW_ROW.x2]).toBe('2');
		expect(link[FLOW_ROW.source]).toBe('C');
		expect(link[FLOW_ROW.target]).toBe('E');
	});

	test('leaves out links that carry nothing, and the nodes only they name', () => {
		const out = run({}, [...LINKS, { source: 'E', target: 'F', value: 0 }]);
		expect(links(out)).toHaveLength(6);
		expect(node(out, 'F')).toBeUndefined();
	});

	test('reads its nodes, columns and links through the accessors it is given', () => {
		const out = run(
			{
				source: 'from',
				target: 'to',
				value: (row: Row) => Number(row.n) * 2,
				nodes: [
					{ key: 'x', stage: 'Origin' },
					{ key: 'y', stage: 'Destination' }
				],
				id: 'key',
				column: 'stage'
			},
			[{ from: 'x', to: 'y', n: 3 }]
		);
		expect(node(out, 'x')[FLOW_ROW.x]).toBe('Origin');
		expect(node(out, 'y')).toMatchObject({ key: 'y', stage: 'Destination' });
		expect(num(node(out, 'y'), 'value')).toBe(6);
	});

	test('orders the columns as `columns` lists them, the rest by depth', () => {
		const out = run({
			nodes: [
				{ id: 'A', c: 'Left' },
				{ id: 'B', c: 'Left' },
				{ id: 'C', c: 'Middle' },
				{ id: 'D', c: 'Middle' },
				{ id: 'E', c: 'Right' }
			],
			column: 'c',
			columns: ['Right']
		});
		const firstLink = links(out).find((row) => row.source === 'C')!;
		// `Right` is first, so the C to E links run backward: their x's are the names, the order is the plot's.
		expect(firstLink[FLOW_ROW.x2]).toBe('Right');
	});

	test("keeps the nodes of a column in their own order with `order: 'input'`, else uncrosses them", () => {
		const data = [
			{ source: 'A', target: 'Y', value: 5 },
			{ source: 'B', target: 'Z', value: 5 }
		];
		const nodesListed = [{ id: 'A' }, { id: 'B' }, { id: 'Z' }, { id: 'Y' }];
		const ids = (out: Out, name: string) => column(out, name).map((row) => row[FLOW_ROW.node]);
		const input = run({ order: 'input', nodes: nodesListed }, data);
		expect(ids(input, '0')).toEqual(['A', 'B']);
		expect(ids(input, '1')).toEqual(['Z', 'Y']);
		const auto = run({ order: 'auto', nodes: nodesListed }, data);
		const crossed = (ids(auto, '0')[0] === 'A') !== (ids(auto, '1')[0] === 'Y');
		expect(crossed).toBe(false);
	});
});

describe('Graph.fromTable', () => {
	const ROWS = [
		{ work: 'CABA', home: 'CABA', year: 2003, n: 10 },
		{ work: 'CABA', home: 'GBA', year: 2003, n: 4 },
		{ work: 'GBA', home: 'GBA', year: 2003, n: 8 },
		{ work: 'CABA', home: 'GBA', year: 2025, n: 6 },
		{ work: 'CABA', home: 'GBA', year: 2025, n: 1 }
	];

	test('makes a node per value of each column, named after it', () => {
		const graph = Graph.fromTable(ROWS, { columns: ['work', 'home'], value: 'n' });
		expect(graph.nodes!.map(({ name, column }) => `${column}:${name}`)).toEqual([
			'work:CABA',
			'work:GBA',
			'home:CABA',
			'home:GBA'
		]);
		expect(graph.column).toBe('column');
	});

	test('sums the value of the rows two neighbouring columns share into one link', () => {
		const graph = Graph.fromTable(ROWS, { columns: ['work', 'home'], value: 'n' });
		const named = (id: string) => graph.nodes!.find((n) => n.id === id)!.name;
		const sums = graph.links.map((l) => `${named(l.source)}>${named(l.target)}=${l.value}`);
		expect(sums).toEqual(['CABA>CABA=10', 'CABA>GBA=11', 'GBA>GBA=8']);
	});

	test('counts the rows without a value, and keeps rows apart by the `by` fields', () => {
		const graph = Graph.fromTable(ROWS, { columns: ['work', 'home'], by: ['year'] });
		expect(graph.links.map((l) => [l.year, l.value])).toEqual([
			[2003, 1],
			[2003, 1],
			[2003, 1],
			[2025, 2]
		]);
	});

	test('is placed by the flow arrangement as it comes', () => {
		const graph = Graph.fromTable(ROWS, { columns: ['work', 'home'], value: 'n' });
		const out = Transforms.run(
			{ type: 'flow', nodes: graph.nodes, column: graph.column } as Transform,
			{ data: graph.links }
		) as Out;
		expect(nodes(out).map((row) => row[FLOW_ROW.x])).toEqual(['work', 'work', 'home', 'home']);
	});
});
