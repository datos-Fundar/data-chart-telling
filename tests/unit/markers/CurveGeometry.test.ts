import { describe, test, expect } from 'vitest';
import { CurveGeometry } from '$lib/markers/labels/geometry/CurveGeometry';
import type { BoxScales } from '$lib/types/markers/labels/box';

// Pixels as the values: `y` grows up the page, as a plot draws it.
const SCALES: BoxScales = {
	x: { type: 'linear', fn: (v: number) => v },
	y: { type: 'linear', fn: (v: number) => 100 - v }
};

const offsetOf = (values: number[], offset: 'max' | 'min') => {
	const data = values.map((value, i) => ({ x: i * 10, value }));
	const [curve] = CurveGeometry.build(
		'stroke',
		{ data, x: 'x', y: 'value', curve: 'linear' },
		{ layout: 'path', text: 'a', offset },
		{ scales: SCALES, gap: 4 }
	);
	return Number.parseFloat(curve.startOffset);
};

describe('CurveGeometry', () => {
	test("`offset: 'max'` is the line's peak, as a share of its length", () => {
		expect(offsetOf([0, 10, 0], 'max')).toBeCloseTo(50);
		expect(offsetOf([10, 0, 0, 0], 'max')).toBe(0);
	});

	test("`offset: 'min'` is its trough", () => {
		expect(offsetOf([1, 10, 0], 'min')).toBeCloseTo(100);
	});

	test('a centred text near an end of its line is moved in to fit whole on it', () => {
		const data = [0, 10, 20].map((x) => ({ x, value: 50 }));
		const at = (offset: 'start' | 'min', width: number) =>
			CurveGeometry.build(
				'stroke',
				{ data, x: 'x', y: 'value', curve: 'linear' },
				{ layout: 'path', text: 'a', offset: offset === 'min' ? 'min' : '0%' },
				{ scales: SCALES, gap: 4, measure: () => width }
			)[0].startOffset;
		// The line is 20px long: a 10px text centred at its start is moved to 25%, a 40px one to its middle.
		expect(at('min', 10)).toBe('25%');
		expect(at('min', 40)).toBe('50%');
	});
});
