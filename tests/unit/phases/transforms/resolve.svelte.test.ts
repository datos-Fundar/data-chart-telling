import { describe, test, expect } from 'vitest';
import { Transforms } from '$lib/phases/transforms/Transforms';
import type { MarkerTransform } from '$lib/types/transforms';

const rows = [
	{ x: 1, y: 2, g: 'A' },
	{ x: 1, y: 3, g: 'B' },
	{ x: 2, y: 4, g: 'A' },
	{ x: 2, y: 1, g: 'B' }
];

describe('Transforms.resolve', () => {
	test('a marker with no transforms comes back unchanged', () => {
		const marker = { type: 'dot', x: 'x', y: 'y' };
		expect(Transforms.resolve(marker, rows)).toBe(marker);
	});

	test('a stackY transform is spread into the marker: its rows and the y1/y2 channels it produces', () => {
		const out = Transforms.resolve(
			{ type: 'area', x: 'x', y: 'y', grouping: 'g', transforms: [{ type: 'stackY' }] },
			rows
		) as unknown as { data: unknown[]; y1: unknown; y2: unknown };
		expect(out.data).toHaveLength(rows.length);
		expect(out.y1).toBeDefined();
		expect(out.y2).toBeDefined();
	});

	test('a transform takes its own channels flat, as svelteplot does', () => {
		const out = Transforms.resolve(
			{ type: 'area', transforms: [{ type: 'stackY', data: rows, x: 'x', y: 'y', z: 'g' }] },
			[]
		) as unknown as { y1: unknown };
		expect(out.y1).toBeDefined();
	});

	test('z defaults to the marker’s grouping, so a grouped marker stacks per group', () => {
		const out = Transforms.resolve(
			{ type: 'area', x: 'x', y: 'y', grouping: 'g', transforms: [{ type: 'stackY' }] },
			rows
		) as unknown as { data: { g: string; y1: number; y2: number }[] };
		expect(out.data.length).toBe(rows.length);
	});
});

describe('Transforms.resolve - a ribbon arriving between y3 and y4', () => {
	const RIBBONS = [
		{ y1: 1, y2: 2, y3: 5, y4: 7 },
		{ y1: 3, y2: 4, y3: 8, y4: 9 }
	];
	const ribbonWith = (transform: MarkerTransform) =>
		Transforms.resolve(
			{
				type: 'ribbon',
				data: RIBBONS,
				y1: 'y1',
				y2: 'y2',
				y3: 'y3',
				y4: 'y4',
				transforms: [transform]
			},
			[]
		) as unknown as Record<string, unknown> & { data: Record<string | symbol, unknown>[] };
	const valuesOf = (marker: ReturnType<typeof ribbonWith>, channel: string) =>
		marker.data.map((row) => {
			const own = marker[channel];
			return typeof own === 'function' ? own(row) : row[own as string];
		});

	test('maps y3 and y4 as it maps y1 and y2, row by row', () => {
		const marker = ribbonWith({
			type: 'mapY',
			map: (_index: number[], values: number[]) => values.map((v) => v * 10)
		});
		expect(valuesOf(marker, 'y1')).toEqual([10, 30]);
		expect(valuesOf(marker, 'y3')).toEqual([50, 80]);
		expect(valuesOf(marker, 'y4')).toEqual([70, 90]);
	});

	test('draws each row once when it maps both y1 and y2', () => {
		const marker = ribbonWith({ type: 'normalizeY', basis: 'first' } as MarkerTransform);
		expect(marker.data).toHaveLength(2);
	});

	test('shifts y3 and y4 by what it shifts y1 and y2', () => {
		const marker = ribbonWith({ type: 'shiftY', by: { y1: 1, y2: 1 } });
		expect(valuesOf(marker, 'y2')).toEqual([3, 5]);
		expect(valuesOf(marker, 'y3')).toEqual([6, 9]);
		expect(valuesOf(marker, 'y4')).toEqual([8, 10]);
	});

	test('leaves them to the rows a transform keeps, when it is not row by row', () => {
		const marker = ribbonWith({ type: 'filter', filter: (row: { y1: number }) => row.y1 > 2 });
		expect(marker.y3).toBe('y3');
		expect(valuesOf(marker, 'y3')).toEqual([8]);
	});
});
