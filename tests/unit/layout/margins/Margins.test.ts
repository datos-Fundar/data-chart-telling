import { describe, test, expect } from 'vitest';
import { Margins } from '$lib/layout/margins/Margins';

describe('Margins', () => {
	test("resolve reads an 'auto' or unset side as the estimate", () => {
		const m = Margins.resolve({ top: 4, right: 'auto' }, Margins.GEO_ESTIMATE);
		expect(m.toJSON()).toEqual({ top: 4, right: 8, bottom: 8, left: 8 });
	});

	test('max, min and plus work side by side', () => {
		const a = new Margins(1, 10, 3, 0);
		const b = new Margins(5, 2, 3, 1);
		expect(a.max(b).toJSON()).toEqual({ top: 5, right: 10, bottom: 3, left: 1 });
		expect(a.min(b).toJSON()).toEqual({ top: 1, right: 2, bottom: 3, left: 0 });
		expect(a.plus(b).toJSON()).toEqual({ top: 6, right: 12, bottom: 6, left: 1 });
	});

	test('equals takes a tolerance', () => {
		const a = new Margins(10, 10, 10, 10);
		expect(a.equals(new Margins(11, 10, 9, 10))).toBe(false);
		expect(a.equals(new Margins(11, 10, 9, 10), 1)).toBe(true);
		expect(a.equals(undefined)).toBe(false);
	});

	test('contentBox is what the margins leave inside a box', () => {
		const box = new Margins(10, 20, 30, 40).contentBox(200, 100);
		expect([box.left, box.top, box.right, box.bottom]).toEqual([40, 10, 180, 70]);
		expect([box.width, box.height]).toEqual([140, 60]);
	});

	test('half caps at half of each dimension', () => {
		expect(Margins.half(200, 100).toJSON()).toEqual({ top: 50, right: 100, bottom: 50, left: 100 });
	});
});
