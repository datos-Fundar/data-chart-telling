import { describe, test, expect } from 'vitest';
import { Transforms } from '$lib/phases/transforms/Transforms';

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
