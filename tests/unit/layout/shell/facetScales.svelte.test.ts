import { describe, test, expect } from 'vitest';
import { buildFacetCellScales, buildSharedAxisScale } from '$lib/layout/shell/facetScales';
import type { FacetAxisValues } from '$lib/types/plots/presentation';

const values = (
	x: unknown[],
	y: unknown[],
	extra: Partial<FacetAxisValues> = {}
): FacetAxisValues => ({
	x,
	y,
	band: [],
	zero: [],
	...extra
});

const EDGES = { top: true, right: true, bottom: true, left: true };

describe('buildSharedAxisScale', () => {
	test('spans every facet on a numeric axis, niced', () => {
		expect(buildSharedAxisScale([values([1, 5], []), values([3, 12], [])], 'x')).toEqual({
			domain: [1, 12],
			nice: true
		});
	});

	test('includes zero when a facet asks for it', () => {
		expect(
			buildSharedAxisScale([values([], [4, 9], { zero: ['y'] }), values([], [2, 3])], 'y')
		).toEqual({ domain: [0, 9], nice: true });
	});

	test('a band axis gets every category, sorted like svelteplot sorts them', () => {
		expect(
			buildSharedAxisScale(
				[values(['b', 'a'], [], { band: ['x'] }), values(['c', 'a'], [], { band: ['x'] })],
				'x'
			)
		).toEqual({ domain: ['a', 'b', 'c'] });
	});

	test('a band axis of numbers stays categorical', () => {
		expect(buildSharedAxisScale([values([2020, 2010], [], { band: ['x'] })], 'x')).toEqual({
			domain: [2010, 2020]
		});
	});

	test('dates span earliest to latest', () => {
		const a = new Date('2020-01-01');
		const b = new Date('2021-06-01');
		expect(buildSharedAxisScale([values([b], []), values([a], [])], 'x')).toEqual({
			domain: [a, b]
		});
	});

	test('no values, no domain', () => {
		expect(buildSharedAxisScale([values([], [])], 'x')).toBeUndefined();
	});
});

type Row = { g: string; h: string; v: number };
const ROWS: Row[] = [
	{ g: 'A', h: 'p', v: 1 },
	{ g: 'A', h: 'q', v: 2 },
	{ g: 'B', h: 'p', v: 10 },
	{ g: 'B', h: 'q', v: 30 }
];
const axisValues = (rows: Row[]) =>
	values(
		rows.map((r) => r.v),
		rows.map((r) => r.v * 2)
	);

describe('buildFacetCellScales', () => {
	test("'shared' (default) gives every facet the same x and y domains", () => {
		const scales = buildFacetCellScales<Row>({ by: 'g' }, ROWS, axisValues);
		const a = scales({ facetValue: 'A', edges: EDGES });
		expect(a?.x?.domain).toEqual([1, 30]);
		expect(a?.y?.domain).toEqual([2, 60]);
		expect(scales({ facetValue: 'B', edges: EDGES })).toEqual(a);
	});

	test("'free' leaves every wrapped facet to fit its own", () => {
		const scales = buildFacetCellScales<Row>({ by: 'g', scales: 'free' }, ROWS, axisValues);
		expect(scales({ facetValue: 'A', edges: EDGES })).toBeUndefined();
	});

	test("'free-x' still shares y across wrapped facets", () => {
		const scales = buildFacetCellScales<Row>({ by: 'g', scales: 'free-x' }, ROWS, axisValues);
		const a = scales({ facetValue: 'A', edges: EDGES });
		expect(a?.x).toBeUndefined();
		expect(a?.y?.domain).toEqual([2, 60]);
	});

	test("in a grid, 'free-x' shares x down each column", () => {
		const scales = buildFacetCellScales<Row>(
			{ rows: 'h', cols: 'g', scales: 'free-x' },
			ROWS,
			axisValues
		);
		expect(scales({ facetValue: 'p · A', row: 'p', col: 'A', edges: EDGES })?.x?.domain).toEqual([
			1, 2
		]);
		expect(scales({ facetValue: 'q · B', row: 'q', col: 'B', edges: EDGES })?.x?.domain).toEqual([
			10, 30
		]);
	});

	test("axes: 'outer' hides a shared axis off the left/bottom edge", () => {
		const scales = buildFacetCellScales<Row>({ by: 'g', axes: 'outer' }, ROWS, axisValues);
		const inner = scales({
			facetValue: 'B',
			edges: { top: true, right: true, bottom: false, left: false }
		});
		expect(inner?.x?.axisDisplay).toBe('none');
		expect(inner?.y?.axisDisplay).toBe('none');
		const corner = scales({
			facetValue: 'A',
			edges: { top: false, right: false, bottom: true, left: true }
		});
		expect(corner?.x?.axisDisplay).toBeUndefined();
		expect(corner?.y?.axisDisplay).toBeUndefined();
	});

	test("axes: 'outer' runs a drawn y axis' title vertically, and only there", () => {
		const scales = buildFacetCellScales<Row>({ by: 'g', axes: 'outer' }, ROWS, axisValues);
		const left = scales({
			facetValue: 'A',
			edges: { top: true, right: false, bottom: true, left: true }
		});
		const inner = scales({
			facetValue: 'B',
			edges: { top: true, right: true, bottom: true, left: false }
		});
		expect(left?.y?.labelOrientation).toBe('vertical');
		expect(left?.x?.labelOrientation).toBeUndefined();
		expect(inner?.y?.labelOrientation).toBeUndefined();
		const all = buildFacetCellScales<Row>({ by: 'g' }, ROWS, axisValues);
		const edges = { top: true, right: false, bottom: true, left: true };
		expect(all({ facetValue: 'A', edges })?.y?.labelOrientation).toBeUndefined();
	});

	test("axes: 'outer' keeps a free axis on every facet", () => {
		const scales = buildFacetCellScales<Row>(
			{ by: 'g', axes: 'outer', scales: 'free-y' },
			ROWS,
			axisValues
		);
		const inner = scales({
			facetValue: 'B',
			edges: { top: true, right: true, bottom: false, left: false }
		});
		expect(inner?.y?.axisDisplay).toBeUndefined();
		expect(inner?.x?.axisDisplay).toBe('none');
	});
});
