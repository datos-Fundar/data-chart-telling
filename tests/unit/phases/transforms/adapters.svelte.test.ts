import { describe, test, expect } from 'vitest';
import { Transforms } from '$lib/phases/transforms/Transforms';
import type { MarkerTransform } from '$lib/types/transforms';

type Row = Record<string | symbol, unknown>;
type Out = { data: Row[]; [key: string]: unknown };

const rows: Row[] = [
	{ t: 1, v: 10, g: 'A' },
	{ t: 2, v: 20, g: 'A' },
	{ t: 3, v: 30, g: 'A' },
	{ t: 4, v: 40, g: 'A' },
	{ t: 1, v: 5, g: 'B' },
	{ t: 2, v: 4, g: 'B' },
	{ t: 3, v: 3, g: 'B' },
	{ t: 4, v: 2, g: 'B' }
];

/** Runs `transforms` on a grouped line marker over {@link rows}. */
function run(transforms: MarkerTransform[], marker: Row = {}): Out {
	return Transforms.resolve(
		{ type: 'line', x: 't', y: 'v', grouping: 'g', transforms, ...marker },
		rows
	) as unknown as Out;
}

/** Reads a channel (field key, symbol or function) off a row. */
function read(row: Row, channel: unknown): unknown {
	return typeof channel === 'function' ? channel(row) : row[channel as string];
}

const valuesOf = (out: Out, channel: string, group?: string) =>
	out.data.filter((d) => group === undefined || d.g === group).map((d) => read(d, out[channel]));

describe('density', () => {
	test('densityX replaces the rows with an estimate per group, its density on y', () => {
		const out = run([{ type: 'densityX' }]);
		expect(out.data.length).toBeGreaterThan(rows.length);
		expect(new Set(out.data.map((d) => d.g))).toEqual(new Set(['A', 'B']));
		const densities = valuesOf(out, 'y') as number[];
		expect(densities.every((d) => Number.isFinite(d) && d >= 0)).toBe(true);
	});

	test('an unset bandwidth falls back to svelteplot’s own default instead of NaN', () => {
		const out = Transforms.run({ type: 'densityX', bandwidth: undefined }, { data: rows, x: 'v' });
		const densities = (out.data as Row[]).map((d) => read(d, out.y)) as number[];
		expect(densities.some((d) => d > 0)).toBe(true);
	});

	test('densityY puts the density on x', () => {
		const out = run([{ type: 'densityY', trim: true }]);
		expect((valuesOf(out, 'x') as number[]).every(Number.isFinite)).toBe(true);
	});
});

describe('window and bollinger', () => {
	test('windowY averages k rows per group', () => {
		const out = run([{ type: 'windowY', k: 2, anchor: 'start' }]);
		expect(valuesOf(out, 'y', 'A')).toEqual([15, 25, 35, 40]);
	});

	test('bollingerY runs per group and keeps each row’s group', () => {
		const out = run([{ type: 'bollingerY', n: 2, k: 1 }]);
		expect(out.data.filter((d) => d.g === 'A')).toHaveLength(4);
		expect(out.grouping).toBe('g');
		expect(valuesOf(out, 'y', 'A').slice(1)).toEqual([15, 25, 35]);
		expect(out.y1).toBeDefined();
		expect(out.y2).toBeDefined();
	});
});

describe('normalize and map', () => {
	test('normalizeY divides each group by its first value', () => {
		const out = run([{ type: 'normalizeY' }]);
		expect(valuesOf(out, 'y', 'A')).toEqual([1, 2, 3, 4]);
		expect(valuesOf(out, 'y', 'B')).toEqual([1, 0.8, 0.6, 0.4]);
	});

	test('normalizeY takes a named basis', () => {
		const out = run([{ type: 'normalizeY', basis: 'sum' }]);
		expect(valuesOf(out, 'y', 'A')).toEqual([0.1, 0.2, 0.3, 0.4]);
	});

	test('mapY cumsum is a running total per group', () => {
		const out = run([{ type: 'mapY', map: 'cumsum' }]);
		expect(valuesOf(out, 'y', 'A')).toEqual([10, 30, 60, 100]);
	});
});

describe('position', () => {
	test('intervalX widens each x into x1/x2', () => {
		const out = run([{ type: 'intervalX', interval: 1 }], { type: 'rect' });
		expect(out.x1).toBeDefined();
		expect(out.x2).toBeDefined();
		expect(read(out.data[0], out.x2)).toBe(2);
	});

	test('intervalX’s interval stays off the marker, and a rect’s value is anchored at zero', () => {
		const out = run([{ type: 'intervalX', interval: 1 }], { type: 'rect' });
		expect(out.interval).toBeUndefined();
		expect(out.y1).toBe(0);
		expect(out.y2).toBe('v');
	});

	test('jitterX is seeded: the same on every run, different from the source', () => {
		const a = valuesOf(run([{ type: 'jitterX', width: 0.3 }]), 'x');
		const b = valuesOf(run([{ type: 'jitterX', width: 0.3 }]), 'x');
		expect(a).toEqual(b);
		expect(a).not.toEqual(rows.map((d) => d.t));
		const c = valuesOf(run([{ type: 'jitterX', width: 0.3, seed: 7 }]), 'x');
		expect(c).not.toEqual(a);
	});

	test('jitterX and jitterY draw different offsets by default', () => {
		const out = run([
			{ type: 'jitterX', width: 0.3 },
			{ type: 'jitterY', width: 0.3 }
		]);
		const dx = out.data.map((d, i) => (read(d, out.x) as number) - (rows[i].t as number));
		const dy = out.data.map((d, i) => (read(d, out.y) as number) - (rows[i].v as number));
		expect(dx).not.toEqual(dy);
	});

	test('shiftY moves every y by the amount', () => {
		const out = run([{ type: 'shiftY', by: 100 }]);
		expect(valuesOf(out, 'y', 'A')).toEqual([110, 120, 130, 140]);
	});
});

describe('order', () => {
	test('sort reorders the rows', () => {
		const out = run([{ type: 'sort', sort: 'v' }]);
		expect(out.data.map((d) => d.v)).toEqual([2, 3, 4, 5, 10, 20, 30, 40]);
	});

	test('sort by another channel reads that channel’s values', () => {
		const out = run([
			{ type: 'groupX', y: 'count' },
			{ type: 'sort', sort: { channel: 'x' } }
		]);
		expect(out.data.map((d) => read(d, out.x))).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
	});

	test('reverse flips the row order', () => {
		expect(run([{ type: 'reverse' }]).data[0]).toEqual(rows.at(-1));
	});

	test('shuffle is seeded', () => {
		const a = run([{ type: 'shuffle' }]).data;
		expect(run([{ type: 'shuffle' }]).data).toEqual(a);
		expect(a).toHaveLength(rows.length);
	});

	test('filter keeps the rows its test holds for', () => {
		const out = run([{ type: 'filter', filter: (d: Row) => (d.v as number) > 4 }]);
		expect(out.data.map((d) => d.v)).toEqual([10, 20, 30, 40, 5]);
	});
});

describe('select', () => {
	test('selectLast keeps one row per group', () => {
		expect(run([{ type: 'selectLast' }]).data.map((d) => d.v)).toEqual([40, 2]);
	});

	test('selectMaxY keeps each group’s peak', () => {
		expect(run([{ type: 'selectMaxY' }]).data.map((d) => d.v)).toEqual([40, 5]);
	});

	test('select takes the criteria directly', () => {
		expect(run([{ type: 'select', select: { y: 'min' } }]).data.map((d) => d.v)).toEqual([10, 2]);
	});
});

describe('group', () => {
	test('groupX reduces the marker’s own y with the transform’s y reducer', () => {
		const out = run([{ type: 'groupX', y: 'sum' }], { grouping: undefined });
		expect(out.data.map((d) => read(d, out.y))).toEqual([15, 24, 33, 42]);
	});

	test('groupX counts per group', () => {
		const out = run([{ type: 'groupX', y: 'count' }]);
		expect(out.data.map((d) => read(d, out.y))).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
	});

	test('groupZ reduces every group to one row', () => {
		const out = run([{ type: 'groupZ', x: 'mean', y: 'mean' }]);
		expect(out.data.map((d) => [read(d, out.x), read(d, out.y)])).toEqual([
			[2.5, 25],
			[2.5, 3.5]
		]);
	});

	test('a fill reducer becomes the marker’s color channel', () => {
		const out = run([{ type: 'group', fill: 'count' }], { type: 'rect', grouping: undefined });
		expect(out.color).toBeDefined();
		expect(out.data.map((d) => read(d, out.color))).toEqual(rows.map(() => 1));
	});
});

describe('2D bin and mosaic', () => {
	test('bin produces cells with both edges', () => {
		const out = run([{ type: 'bin', fill: 'count', thresholds: 2 }], {
			type: 'rect',
			grouping: undefined
		});
		for (const key of ['x1', 'x2', 'y1', 'y2', 'color']) expect(out[key]).toBeDefined();
	});

	test('stackMosaicX lays the cells out on both axes', () => {
		const out = Transforms.resolve(
			{
				type: 'rect',
				x: 'g',
				y: 't',
				transforms: [{ type: 'stackMosaicX', value: 'v' }]
			},
			rows
		) as unknown as Out;
		for (const key of ['x1', 'x2', 'y1', 'y2']) expect(out[key]).toBeDefined();
		expect(out.data).toHaveLength(rows.length);
	});
});
