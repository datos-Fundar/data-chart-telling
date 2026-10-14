import { describe, test, expect } from 'vitest';
import { Box } from '$lib/layout/margins/Box';

const CFG = { font: 'sans-serif' };

describe('Box.ofText', () => {
	test('a longer text measures wider', () => {
		expect(Box.ofText('A very long label indeed', 14, CFG).width).toBeGreaterThan(
			Box.ofText('A', 14, CFG).width
		);
	});

	test('a larger font measures wider and taller', () => {
		const small = Box.ofText('Buenos Aires', 10, CFG);
		const large = Box.ofText('Buenos Aires', 30, CFG);
		expect(large.width).toBeGreaterThan(small.width);
		expect(large.height).toBe(36);
	});

	test('an empty text measures 0 wide', () => {
		expect(Box.ofText('', 14, CFG).width).toBe(0);
	});
});

describe('Box.overflow', () => {
	const bounds = new Box(10, 10, 100, 50);

	test('how far a box reaches past its bounds, on each side', () => {
		expect(new Box(0, 5, 130, 20).overflow(bounds).toJSON()).toEqual({
			top: 5,
			right: 20,
			bottom: 0,
			left: 10
		});
	});

	test('a box inside, or an empty one, reaches nowhere', () => {
		expect(new Box(20, 20, 10, 10).overflow(bounds).empty).toBe(true);
		expect(new Box(-100, -100, 0, 0).overflow(bounds).empty).toBe(true);
	});
});

describe('Box.beside and reach', () => {
	const label = Box.size(40, 12);

	test('beside places the box before, after or centred on a point, `gap` px away', () => {
		const after = label.beside({ x: 0, y: 0 }, { x: 'after', y: 'middle' }, { x: 6 });
		expect([after.left, after.top, after.right, after.bottom]).toEqual([6, -6, 46, 6]);
		const before = label.beside({ x: 0, y: 0 }, { x: 'before', y: 'before' }, { x: 6, y: 8 });
		expect([before.left, before.top]).toEqual([-46, -20]);
	});

	test('reach is how far the box reaches out from its origin', () => {
		const above = label.beside({ x: 0, y: -6 }, { x: 'middle', y: 'before' });
		expect(above.reach.toJSON()).toEqual({ top: 18, right: 20, bottom: 0, left: 20 });
	});
});
