import { describe, test, expect } from 'vitest';
import { Declutter } from '$lib/markers/text/Declutter';
import { Box } from '$lib/layout/margins/Box';

const LABEL = Box.size(30, 12);
const BOUNDS = Box.size(200, 100);
const RIGHT = { x: 'after', y: 'middle' } as const;
const ABOVE = { x: 'middle', y: 'before' } as const;

const place = (
	points: [number, number][],
	bounds = BOUNDS,
	preferred: { x: 'before' | 'middle' | 'after'; y: 'before' | 'middle' | 'after' } = RIGHT
) =>
	Declutter.around({
		items: points.map(([px, py], key) => ({ key, px, py, box: LABEL })),
		preferred,
		gap: 6,
		bounds
	});

describe('Declutter.around', () => {
	test('a lone label takes its own side', () => {
		expect(place([[50, 50]]).get(0)).toEqual({ anchor: RIGHT, dx: 6, dy: 0 });
	});

	test('a label that would cover another point takes the next spot clockwise', () => {
		// Above the first point is the second one: the label goes on to the top right.
		const spots = place(
			[
				[50, 50],
				[50, 40]
			],
			BOUNDS,
			ABOVE
		);
		expect(spots.get(0)?.anchor).toEqual({ x: 'after', y: 'before' });
	});

	test('a label clear of the points but not of a placed label moves on', () => {
		const spots = place([
			[50, 50],
			[50, 60]
		]);
		expect(spots.get(0)?.anchor).toEqual(RIGHT);
		expect(spots.get(1)?.anchor).not.toEqual(RIGHT);
	});

	test('a label stays inside the bounds, going on clockwise from its own side', () => {
		// At the right edge: past the right, the bottom right and the bottom, the bottom left is the first inside.
		expect(place([[195, 50]]).get(0)?.anchor).toEqual({ x: 'before', y: 'after' });
	});

	test('a label on its point tries it first, then goes round from above', () => {
		const ON = { x: 'middle', y: 'middle' } as const;
		expect(place([[50, 50]], BOUNDS, ON).get(0)?.anchor).toEqual(ON);
	});

	test('a label with no free spot is left out', () => {
		const tight = Box.size(40, 20);
		expect(place([[20, 10]], tight).has(0)).toBe(false);
	});
});
