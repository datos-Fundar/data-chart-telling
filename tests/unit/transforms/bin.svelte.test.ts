import { describe, test, expect } from 'vitest';
import { resolveTransforms } from '$lib/utils/transforms';

type Row = Record<string, unknown>;

const rows: Row[] = [
	{ v: 1, w: 9, g: 'A' },
	{ v: 4, w: 9, g: 'B' },
	{ v: 12, w: 9, g: 'A' },
	{ v: 15, w: 9, g: 'A' },
	{ v: 18, w: 9, g: 'B' }
];

/** The bins' own rows: the bin's count as `__y`, read off each bin by its edges. */
function counts(out: { data: Row[] }) {
	return out.data.map((d) => d.__y);
}

describe('binX transform', () => {
	test('bins the marker’s x and reduces each bin with a count', () => {
		const out = resolveTransforms(
			{
				type: 'rect',
				x: 'v',
				transforms: [{ type: 'binX', y: 'count', thresholds: [0, 10, 20] }]
			},
			rows
		) as unknown as { data: Row[]; x: unknown; x1: symbol; x2: symbol; y: string };
		expect(out.data).toHaveLength(2);
		expect(counts({ data: out.data })).toEqual([2, 3]);
		expect(out.y).toBe('__y');
	});

	test('each bin’s edges are read through the symbol channels it outputs, and neighbours share a threshold', () => {
		const out = resolveTransforms(
			{
				type: 'rect',
				x: 'v',
				transforms: [{ type: 'binX', y: 'count', thresholds: [0, 10, 20] }]
			},
			rows
		) as unknown as { data: Row[]; x1: symbol; x2: symbol };
		const [first, second] = out.data as [Record<symbol, unknown>, Record<symbol, unknown>];
		// d3 closes the last bin at the data's own maximum (18), not at the last threshold
		expect(first[out.x2]).toBe(10);
		expect(second[out.x1]).toBe(10);
		expect(second[out.x2]).toBe(18);
	});

	test('the marker’s own y is not read as the count reducer', () => {
		const out = resolveTransforms(
			{
				type: 'rect',
				x: 'v',
				y: 'w',
				transforms: [{ type: 'binX', y: 'count', thresholds: [0, 10, 20] }]
			},
			rows
		) as unknown as { data: Row[] };
		expect(counts(out)).toEqual([2, 3]);
	});

	test('z defaults to the marker’s grouping, so each group is binned on its own', () => {
		const out = resolveTransforms(
			{
				type: 'rect',
				x: 'v',
				grouping: 'g',
				transforms: [{ type: 'binX', y: 'count', thresholds: [0, 10, 20] }]
			},
			rows
		) as unknown as { data: Row[] };
		// bin [0,10): A has 1, B has 1; bin [10,20): A has 2, B has 1
		expect(out.data).toHaveLength(4);
		expect(counts(out).reduce((a, b) => (a as number) + (b as number), 0)).toBe(5);
	});

	test('a transform’s own props win over the marker’s defaults', () => {
		const out = resolveTransforms(
			{
				type: 'rect',
				x: 'w',
				transforms: [{ type: 'binX', x: 'v', y: 'count', thresholds: [0, 10, 20] }]
			},
			rows
		) as unknown as { data: Row[] };
		expect(counts(out)).toEqual([2, 3]);
	});

	test('a cumulative count accumulates the bins from the start', () => {
		const out = resolveTransforms(
			{
				type: 'rect',
				x: 'v',
				transforms: [{ type: 'binX', y: 'count', thresholds: [0, 10, 20], cumulative: 1 }]
			},
			rows
		) as unknown as { data: Row[] };
		expect(counts(out)).toEqual([2, 5]);
	});
});

describe('a rect a bin gives a y', () => {
	test('draws from zero up to its count, since a bin’s y is a bar height', () => {
		const out = resolveTransforms(
			{
				type: 'rect',
				x: 'v',
				transforms: [{ type: 'binX', y: 'count', thresholds: [0, 10, 20] }]
			},
			rows
		) as unknown as { y1: number; y2: string };
		expect(out.y1).toBe(0);
		expect(out.y2).toBe('__y');
	});
});

describe('a binY’s bars run from zero along x', () => {
	test('each bar goes from zero to its count, the count being on x', () => {
		const out = resolveTransforms(
			{
				type: 'rect',
				y: 'v',
				transforms: [{ type: 'binY', x: 'count', thresholds: [0, 10, 20] }]
			},
			rows
		) as unknown as { x1: unknown; x2: string };
		expect(out.x1).toBe(0);
		expect(out.x2).toBe('__x');
	});
});

describe('binY transform', () => {
	test('bins the marker’s y, and its reducer goes to x', () => {
		const out = resolveTransforms(
			{
				type: 'rect',
				y: 'v',
				transforms: [{ type: 'binY', x: 'count', thresholds: [0, 10, 20] }]
			},
			rows
		) as unknown as { data: Row[]; x: string };
		expect(out.x).toBe('__x');
		expect(out.data.map((d) => d.__x)).toEqual([2, 3]);
	});

	test('the marker’s own x is not read as the count reducer', () => {
		const out = resolveTransforms(
			{
				type: 'rect',
				x: 'w',
				y: 'v',
				transforms: [{ type: 'binY', x: 'count', thresholds: [0, 10, 20] }]
			},
			rows
		) as unknown as { data: Row[] };
		expect(out.data.map((d) => d.__x)).toEqual([2, 3]);
	});
});
