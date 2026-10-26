import { describe, test, expect } from 'vitest';
import { SveltePlotScale } from '$lib/layout/scales/SveltePlotScale';

type Row = { x: string | number | Date };
const read = (row: Row) => row.x;
const fit = { axis: 'x' as const, span: 400 };

describe('SveltePlotScale.build - nice', () => {
	test('is dropped from a categorical axis, which svelteplot would draw as linear', () => {
		const rows: Row[] = [{ x: '2026-08-03' }, { x: '2026-08-04' }];
		const built = SveltePlotScale.build({ nice: true, label: false }, rows, read, fit);
		expect(built).toEqual({ label: false });
	});

	test('nices a numeric axis itself, into a pinned domain', () => {
		const rows: Row[] = [{ x: 1947 }, { x: 2019 }];
		expect(SveltePlotScale.build({ nice: true }, rows, read, fit)).toEqual({
			domain: [1940, 2020],
			nice: false
		});
	});

	test('counts at least three ticks on a narrow x axis', () => {
		const rows: Row[] = [{ x: 1947 }, { x: 2019 }];
		const built = SveltePlotScale.build({ nice: true }, rows, read, { axis: 'x', span: 100 });
		expect(built?.domain).toEqual([1940, 2020]);
	});

	test('stays on a temporal axis', () => {
		const rows: Row[] = [{ x: new Date(2026, 7, 3) }, { x: new Date(2026, 7, 4) }];
		expect(SveltePlotScale.build({ nice: true }, rows, read, fit)).toEqual({ nice: true });
	});
});
