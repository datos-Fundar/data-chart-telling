import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { buildClevelandDefaults } from '$lib/plots/cleveland/defaults';
import { buildForestDefaults } from '$lib/plots/forest/defaults';
import { buildBarDefaults } from '$lib/plots/bar/defaults';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { CategorySort } from '$lib/types/layout/scales';

type Row = Record<string, unknown>;

/** The category axis' domain a kind's pipeline leaves for these props. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function domainOf(kind: AxisPlotDefaults<any, any>, props: Row, axis: 'x' | 'y' = 'x') {
	const state = Pipeline.ofAxisKind(kind).run(
		{ width: 400, height: 300, segments: {}, markers: [], ...props },
		{ cfg: DEFAULT_CONFIG }
	) as unknown as { scales: Record<string, { domain?: unknown[]; sort?: unknown }> };
	return { domain: state.scales[axis]?.domain, sort: state.scales[axis]?.sort };
}

/** Three categories, a value in each of two series: `a` spans 1-9, `b` 4-6, `c` 3-12. */
const rows = [
	{ c: 'a', v: 1, g: 'lo' },
	{ c: 'a', v: 9, g: 'hi' },
	{ c: 'b', v: 4, g: 'lo' },
	{ c: 'b', v: 6, g: 'hi' },
	{ c: 'c', v: 3, g: 'lo' },
	{ c: 'c', v: 12, g: 'hi' }
];
const props = (sort: CategorySort | ((a: Row, b: Row) => number), extra: Row = {}) => ({
	data: rows,
	x: 'c',
	y: 'v',
	color: 'g',
	scales: { x: { sort } },
	...extra
});

describe('scales.sort by what the categories hold', () => {
	const cleveland = buildClevelandDefaults<Row>();

	test('by range orders the categories by the spread of their values', () => {
		expect(domainOf(cleveland, props({ by: 'range' })).domain).toEqual(['b', 'a', 'c']);
		expect(domainOf(cleveland, props({ by: 'range', order: 'descending' })).domain).toEqual([
			'c',
			'a',
			'b'
		]);
	});

	test("by value with a series orders them by that series' value", () => {
		expect(domainOf(cleveland, props({ by: 'value', series: 'lo' })).domain).toEqual([
			'a',
			'c',
			'b'
		]);
		expect(
			domainOf(cleveland, props({ by: 'value', series: 'hi', order: 'descending' })).domain
		).toEqual(['c', 'a', 'b']);
	});

	test('by value without a series orders them by the sum of their values', () => {
		// a: 10, b: 10, c: 15 - the tie keeps the order the data gives.
		expect(domainOf(cleveland, props({ by: 'value' })).domain).toEqual(['a', 'b', 'c']);
		expect(domainOf(cleveland, props({ by: 'value', order: 'descending' })).domain).toEqual([
			'c',
			'a',
			'b'
		]);
	});

	test('a category with no value in the series goes last, whatever the order', () => {
		const partial = [...rows, { c: 'd', v: 2, g: 'lo' }];
		const sortedBy = (order: 'ascending' | 'descending') =>
			domainOf(cleveland, {
				...props({ by: 'value', series: 'hi', order }),
				data: partial
			}).domain;
		expect(sortedBy('ascending')).toEqual(['b', 'a', 'c', 'd']);
		expect(sortedBy('descending')).toEqual(['c', 'a', 'b', 'd']);
	});

	test("the author's own domain wins, and the axis is left without a sort to read", () => {
		const out = domainOf(
			cleveland,
			props({ by: 'range' }, { scales: { x: { sort: { by: 'range' }, domain: ['c', 'b', 'a'] } } })
		);
		expect(out.domain).toEqual(['c', 'b', 'a']);
		expect(out.sort).toBeUndefined();
	});

	test('a comparator is left for the axis to apply', () => {
		const comparator = (a: Row, b: Row) => String(b.c).localeCompare(String(a.c));
		expect(domainOf(cleveland, props(comparator)).sort).toBe(comparator);
	});

	test('it works along y for sideways rows, and on a bar plot', () => {
		expect(
			domainOf(
				cleveland,
				{
					data: rows,
					x: 'v',
					y: 'c',
					color: 'g',
					scales: { y: { sort: { by: 'range', order: 'descending' } } }
				},
				'y'
			).domain
		).toEqual(['c', 'a', 'b']);
		expect(
			domainOf(buildBarDefaults<Row>(), {
				data: rows,
				x: 'c',
				y: 'v',
				color: 'g',
				scales: { x: { sort: { by: 'value', order: 'descending' } } }
			}).domain
		).toEqual(['c', 'a', 'b']);
	});

	test('facet panels share the order read off every row', () => {
		const faceted = rows.flatMap((row) => [
			{ ...row, p: 'one' },
			{ ...row, v: row.c === 'b' ? row.v + 30 : row.v, p: 'two' }
		]);
		const kind = buildClevelandDefaults<Row>();
		const run = Pipeline.ofAxisKind(kind).runData(
			{
				...props({ by: 'range' }),
				width: 400,
				height: 300,
				segments: {},
				markers: [],
				data: faceted
			},
			faceted,
			{ by: 'p' } as never,
			null,
			DEFAULT_CONFIG
		) as unknown as { sharedScales?: Record<string, { x?: { domain?: unknown[] } }> };
		// Every panel reads the same order: over both panels, b spans the most (4-36), then c and a.
		const orders = Object.values(run.sharedScales ?? {}).map((scales) => scales.x?.domain);
		expect(orders).toHaveLength(2);
		for (const order of orders) expect(order).toEqual(['a', 'c', 'b']);
	});
});

describe('scales.sort on an interval plot', () => {
	const forest = buildForestDefaults<Row>();
	/** Two groups of two rows: widths a 2, b 8 (group x), c 6, d 1 (group y); values a 5, b 3, c 9, d 7. */
	const intervals = [
		{ c: 'a', v: 5, lo: 4, hi: 6, g: 'x' },
		{ c: 'b', v: 3, lo: 0, hi: 8, g: 'x' },
		{ c: 'c', v: 9, lo: 6, hi: 12, g: 'y' },
		{ c: 'd', v: 7, lo: 6.5, hi: 7.5, g: 'y' }
	];
	const order = (sort: CategorySort) =>
		domainOf(
			forest,
			{
				data: intervals,
				x: 'c',
				y: 'v',
				lower: 'lo',
				upper: 'hi',
				color: 'g',
				scales: { x: { sort } }
			},
			'x'
		).domain;

	test('by range orders them by the width of their interval', () => {
		expect(order({ by: 'range' })).toEqual(['d', 'a', 'c', 'b']);
	});

	test('grouped keeps each series together and orders within it', () => {
		expect(order({ by: 'range', grouped: true })).toEqual(['a', 'b', 'd', 'c']);
		expect(order({ by: 'value', order: 'descending' })).toEqual(['c', 'd', 'a', 'b']);
		expect(order({ by: 'value', order: 'descending', grouped: true })).toEqual([
			'a',
			'b',
			'c',
			'd'
		]);
	});
});
