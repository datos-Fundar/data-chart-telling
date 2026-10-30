import { describe, test, expect } from 'vitest';
import { Delta } from '$lib/markers/delta/Delta';
import type { DeltaMarkerConfig } from '$lib/types/markers/axis/delta';

const BASE = {
	type: 'delta',
	axis: 'x',
	from: { type: 'series', series: 'a' },
	to: { type: 'series', series: 'b' }
} as const satisfies Partial<DeltaMarkerConfig>;

describe('Delta.points', () => {
	test('one position is one delta', () => {
		const points = Delta.points({ ...BASE, at: 2005 });
		expect(points.map((point) => point.at)).toEqual([2005]);
	});

	test('a list is one delta per position, in order, with the same ends', () => {
		const points = Delta.points({ ...BASE, at: [2005, 2015, 2025] });
		expect(points.map((point) => point.at)).toEqual([2005, 2015, 2025]);
		for (const point of points) {
			expect(point.from).toEqual(BASE.from);
			expect(point.to).toEqual(BASE.to);
			expect(point.type).toBe('delta');
		}
	});

	test('a style that is not a function is the same at every position', () => {
		const text = { dx: 20 };
		const points = Delta.points({ ...BASE, at: [1, 2], text });
		expect(points.map((point) => point.text)).toEqual([text, text]);
	});

	test('a style that is a function gets each position and gives that delta its own', () => {
		const points = Delta.points({
			...BASE,
			at: [2005, 2015],
			text: (at) => (at === 2015 ? { dx: -20, textAnchor: 'end' } : { dx: 20 }),
			line: (at) => ({ stroke: at === 2005 ? 'red' : 'blue' }),
			dot: (at) => ({ dotRadius: Number(at) - 2000 })
		});
		expect(points.map((point) => point.text)).toEqual([{ dx: 20 }, { dx: -20, textAnchor: 'end' }]);
		expect(points.map((point) => point.line?.stroke)).toEqual(['red', 'blue']);
		expect(points.map((point) => point.dot?.dotRadius)).toEqual([5, 15]);
	});

	test('a function also styles a single position', () => {
		const [point] = Delta.points({ ...BASE, at: 2010, text: (at) => ({ dx: Number(at) }) });
		expect(point.text).toEqual({ dx: 2010 });
	});

	test('a style left out stays out', () => {
		const [point] = Delta.points({ ...BASE, at: 2010 });
		expect(point.text).toBeUndefined();
		expect(point.line).toBeUndefined();
		expect(point.dot).toBeUndefined();
	});
});
