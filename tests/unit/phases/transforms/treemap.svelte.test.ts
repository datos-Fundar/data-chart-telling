import { describe, expect, test } from 'vitest';
import { Transforms } from '$lib/phases/transforms/Transforms';
import { TREEMAP_ROW } from '$lib/phases/transforms/methods/TreemapTransform';
import type { MarkerTransform } from '$lib/types/transforms';

type Row = Record<string | symbol, unknown>;
type Out = { data: Row[]; [key: string]: unknown };

const ROWS: Row[] = [
	{ sector: 'A', kind: 'x', branch: 'a1', v: 40 },
	{ sector: 'A', kind: 'x', branch: 'a2', v: 10 },
	{ sector: 'A', kind: 'y', branch: 'a3', v: 10 },
	{ sector: 'B', kind: 'x', branch: 'b1', v: 30 },
	{ sector: 'B', kind: 'y', branch: 'b2', v: 10 }
];

const run = (transform: Omit<Extract<MarkerTransform, { type: 'treemap' }>, 'type'>, data = ROWS) =>
	Transforms.run({ type: 'treemap', ...transform } as MarkerTransform, { data }) as Out;

/** A tile's number off its row, through the channel the transform names (a symbol key). */
const at = (out: Out, row: Row, channel: string) => Number(row[out[channel] as symbol]);
const area = (out: Out, row: Row) =>
	(at(out, row, 'x2') - at(out, row, 'x1')) * (at(out, row, 'y2') - at(out, row, 'y1'));
const nameOf = (row: Row) => row[TREEMAP_ROW.name];

describe('treemap transform', () => {
	test('makes a tile per distinct path of its levels, its area its share of the unit square', () => {
		const out = run({ value: 'v', levels: ['sector', 'branch'] });
		expect(out.data).toHaveLength(5);
		for (const row of out.data) {
			expect(area(out, row)).toBeCloseTo(Number(row.v) / 100, 6);
			expect(row[TREEMAP_ROW.share]).toBeCloseTo(Number(row.v) / 100, 6);
		}
		expect(out.data.reduce((sum, row) => sum + Number(row[TREEMAP_ROW.share]), 0)).toBeCloseTo(
			1,
			6
		);
	});

	test('adds the centre of each tile as `x` and `y`', () => {
		const out = run({ value: 'v', levels: ['branch'] });
		for (const row of out.data) {
			expect(at(out, row, 'x')).toBeCloseTo((at(out, row, 'x1') + at(out, row, 'x2')) / 2, 6);
			expect(at(out, row, 'y')).toBeCloseTo((at(out, row, 'y1') + at(out, row, 'y2')) / 2, 6);
		}
	});

	test('sums the rows of a tile that levels share, and leaves the sum on the value field', () => {
		const out = run({ value: 'v', levels: ['sector', 'kind'] });
		expect(out.data).toHaveLength(4);
		const ax = out.data.find((row) => nameOf(row) === 'x' && row.sector === 'A')!;
		expect(ax[TREEMAP_ROW.value]).toBe(50);
		expect(ax.v).toBe(50);
		expect(area(out, ax)).toBeCloseTo(0.5, 6);
	});

	test("names a tile after its last level, and gives its path's every level", () => {
		const out = run({ value: 'v', levels: ['sector', 'kind', 'branch'] });
		const b2 = out.data.find((row) => nameOf(row) === 'b2')!;
		expect(b2[TREEMAP_ROW.path]).toEqual(['B', 'y', 'b2']);
	});

	test('keeps the tiles of a group together in a rectangle of their own', () => {
		const out = run({ value: 'v', levels: ['sector', 'branch'] });
		const of = (sector: string) => out.data.filter((row) => row.sector === sector);
		const box = (rows: Row[]) => {
			const x1 = Math.min(...rows.map((r) => at(out, r, 'x1')));
			const x2 = Math.max(...rows.map((r) => at(out, r, 'x2')));
			const y1 = Math.min(...rows.map((r) => at(out, r, 'y1')));
			const y2 = Math.max(...rows.map((r) => at(out, r, 'y2')));
			return (x2 - x1) * (y2 - y1);
		};
		expect(box(of('A'))).toBeCloseTo(0.6, 6);
		expect(box(of('B'))).toBeCloseTo(0.4, 6);
	});

	test('with no levels, every row is part of one tile that fills the square', () => {
		const out = run({ value: 'v' });
		expect(out.data).toHaveLength(1);
		const [tile] = out.data;
		expect(tile[TREEMAP_ROW.value]).toBe(100);
		expect(area(out, tile)).toBeCloseTo(1, 6);
		expect(tile[TREEMAP_ROW.path]).toEqual([]);
	});

	test('reads `value` and the levels from functions too', () => {
		const out = run({
			value: (row) => Number(row.v) * 2,
			levels: [(row) => String(row.sector).toLowerCase()]
		});
		expect(out.data.map(nameOf).sort()).toEqual(['a', 'b']);
		expect(out.data.find((row) => nameOf(row) === 'a')![TREEMAP_ROW.value]).toBe(120);
	});

	test('skips a row without a positive value, and makes no tile for no rows', () => {
		const rows = [...ROWS, { sector: 'C', kind: 'x', branch: 'c1', v: 0 }, { sector: 'C', v: NaN }];
		expect(run({ value: 'v', levels: ['sector'] }, rows).data).toHaveLength(2);
		expect(run({ value: 'v', levels: ['sector'] }, []).data).toEqual([]);
	});

	test('lays the biggest tile of a group first', () => {
		const out = run({ value: 'v', levels: ['sector', 'branch'] });
		const a = out.data.filter((row) => row.sector === 'A').map(nameOf);
		expect(a).toEqual(['a1', 'a2', 'a3']);
	});

	test('shapes squarified tiles after the aspect of its box, and stays in the unit square', () => {
		const out = run({ value: 'v', levels: ['branch'], aspect: 4 });
		for (const row of out.data) {
			expect(at(out, row, 'x1')).toBeGreaterThanOrEqual(0);
			expect(at(out, row, 'x2')).toBeLessThanOrEqual(1 + 1e-9);
			expect(at(out, row, 'y2')).toBeLessThanOrEqual(1 + 1e-9);
			// A tile of unit width `w` is `4w` wide on a box four times wider than tall.
			const ratio =
				((at(out, row, 'x2') - at(out, row, 'x1')) * 4) / (at(out, row, 'y2') - at(out, row, 'y1'));
			expect(Math.max(ratio, 1 / ratio)).toBeLessThan(6);
		}
	});

	test("takes the tile type's layout: slice stacks in rows, dice sets side by side", () => {
		const slice = run({ value: 'v', levels: ['branch'], tile: 'slice' });
		const dice = run({ value: 'v', levels: ['branch'], tile: 'dice' });
		for (const row of slice.data)
			expect(at(slice, row, 'x2') - at(slice, row, 'x1')).toBeCloseTo(1, 6);
		for (const row of dice.data)
			expect(at(dice, row, 'y2') - at(dice, row, 'y1')).toBeCloseTo(1, 6);
	});

	test('runs as a plot transform: the rows it makes carry channels the marks read', () => {
		const out = Transforms.resolve(
			{
				data: ROWS,
				transforms: [{ type: 'treemap', value: 'v', levels: ['sector'] }] as MarkerTransform[]
			},
			ROWS
		) as unknown as Out;
		expect(out.data).toHaveLength(2);
		for (const channel of ['x1', 'x2', 'y1', 'y2', 'x', 'y']) {
			expect(typeof out[channel]).toBe('symbol');
		}
	});

	test('asks for its data and its value', () => {
		expect(() => Transforms.run({ type: 'treemap' } as MarkerTransform, { data: ROWS })).toThrow(
			/value/
		);
		expect(() => Transforms.run({ type: 'treemap', value: 'v' } as MarkerTransform, {})).toThrow(
			/data/
		);
	});
});
