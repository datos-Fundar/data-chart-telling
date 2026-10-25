import { describe, test, expect } from 'vitest';
import { RowOffset } from '$lib/markers/utils/RowOffset';

describe('RowOffset', () => {
	test('whole takes only the numbers', () => {
		expect(RowOffset.whole({ dx: 4, dy: (row: { v: number }) => row.v })).toEqual({ dx: 4, dy: 0 });
		expect(RowOffset.whole({})).toEqual({ dx: 0, dy: 0 });
	});

	test('isPerRow is true when either one is a function', () => {
		expect(RowOffset.isPerRow({ dx: 1, dy: 2 })).toBe(false);
		expect(RowOffset.isPerRow({ dx: 1, dy: () => 2 })).toBe(true);
	});

	test('ofRow takes only the functions, so no part is applied twice', () => {
		const marker = { dx: 4, dy: (row: { v: number }) => row.v * 2 };
		expect(RowOffset.ofRow(marker, { v: 5 })).toEqual({ dx: 0, dy: 10 });
	});

	test('whole takes the fallback for a part left unset, and none for a function', () => {
		expect(RowOffset.whole({ dy: 3 }, { dx: 8, dy: 9 })).toEqual({ dx: 8, dy: 3 });
		expect(RowOffset.whole({ dx: () => 5 }, { dx: 8, dy: 9 })).toEqual({ dx: 0, dy: 9 });
	});
});
