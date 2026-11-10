import { describe, test, expect } from 'vitest';
import { Declutter } from '$lib/markers/text/Declutter';
import { Box } from '$lib/layout/margins/Box';

const LABEL = Box.size(30, 12);
const BOUNDS = Box.size(200, 100);
const RIGHT = { x: 'after', y: 'middle' } as const;

const place = (points: [number, number][], bounds = BOUNDS) =>
	Declutter.around({
		items: points.map(([px, py], key) => ({ key, px, py, box: LABEL })),
		preferred: RIGHT,
		gap: 6,
		bounds
	});

describe('Declutter.around', () => {
	test('a lone label takes its own side', () => {
		expect(place([[50, 50]]).get(0)).toEqual({ anchor: RIGHT, dx: 6, dy: 0 });
	});

	test('a label that would cover another point takes the next free spot', () => {
		const spots = place([
			[50, 50],
			[60, 50]
		]);
		expect(spots.get(0)?.anchor).toEqual({ x: 'before', y: 'middle' });
		expect(spots.get(1)?.anchor).toEqual(RIGHT);
	});

	test('a label clear of the points but not of a placed label moves on', () => {
		const spots = place([
			[50, 50],
			[50, 60]
		]);
		expect(spots.get(0)?.anchor).toEqual(RIGHT);
		expect(spots.get(1)?.anchor).not.toEqual(RIGHT);
	});

	test('a label stays inside the bounds', () => {
		expect(place([[195, 50]]).get(0)?.anchor).toEqual({ x: 'before', y: 'middle' });
	});

	test('a label with no free spot is left out', () => {
		const tight = Box.size(40, 20);
		expect(place([[20, 10]], tight).has(0)).toBe(false);
	});
});
