import { describe, test, expect } from 'vitest';
import { MarkerOrientation } from '$lib/phases/statistics/MarkerOrientation';

const ROWS = [
	{ region: 'Norte', gdp: 10, year: 2020 },
	{ region: 'Sur', gdp: 20, year: 2021 }
];

describe('MarkerOrientation', () => {
	test('a band runs across its own axis', () => {
		expect(MarkerOrientation.of({ type: 'area', y: 'year', x1: 0, x2: 'gdp' }, ROWS)).toBe(true);
		expect(MarkerOrientation.of({ type: 'area', x: 'year', y1: 0, y2: 'gdp' }, ROWS)).toBe(false);
	});

	test('two channels run as a plot would', () => {
		expect(MarkerOrientation.of({ type: 'tick', x: 'gdp', y: 'region' }, ROWS)).toBe(true);
		expect(MarkerOrientation.of({ type: 'tick', x: 'region', y: 'gdp' }, ROWS)).toBe(false);
		expect(
			MarkerOrientation.of({ type: 'box', x: 'gdp', y: 'year' }, ROWS, { y: { type: 'band' } })
		).toBe(true);
	});

	test('a single channel is the measured value', () => {
		expect(MarkerOrientation.of({ type: 'box', x: 'gdp' }, ROWS)).toBe(true);
		expect(MarkerOrientation.of({ type: 'box', y: 'gdp' }, ROWS)).toBe(false);
		expect(MarkerOrientation.of({ type: 'box' }, ROWS)).toBeUndefined();
	});

	test("orients only oriented kinds that don't set it", () => {
		const tick = { type: 'tick', x: 'gdp', y: 'region' };
		expect(MarkerOrientation.orient(tick, ROWS)).toEqual({ ...tick, isHorizontal: true });
		expect(MarkerOrientation.orient({ ...tick, isHorizontal: false }, ROWS).isHorizontal).toBe(
			false
		);
		const dot = { type: 'dot', x: 'gdp', y: 'region' };
		expect(MarkerOrientation.orient(dot, ROWS)).toBe(dot);
	});
});
