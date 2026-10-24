import { describe, test, expect } from 'vitest';
import { SveltePlotScale } from '$lib/layout/scales/SveltePlotScale';

type Row = { x: string | number | Date };
const read = (row: Row) => row.x;

describe('SveltePlotScale.build - nice', () => {
	test('is dropped from a categorical axis, which svelteplot would draw as linear', () => {
		const rows: Row[] = [{ x: '2026-08-03' }, { x: '2026-08-04' }];
		const built = SveltePlotScale.build({ nice: true, label: false }, rows, read);
		expect(built).toEqual({ label: false });
	});

	test('stays on a numeric axis', () => {
		const rows: Row[] = [{ x: 1 }, { x: 5 }];
		expect(SveltePlotScale.build({ nice: true }, rows, read)?.nice).toBe(true);
	});

	test('stays on a temporal axis', () => {
		const rows: Row[] = [{ x: new Date(2026, 7, 3) }, { x: new Date(2026, 7, 4) }];
		expect(SveltePlotScale.build({ nice: true }, rows, read)).toEqual({ nice: true });
	});
});
