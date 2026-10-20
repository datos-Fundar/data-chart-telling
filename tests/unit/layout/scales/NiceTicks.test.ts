import { describe, test, expect } from 'vitest';
import { NiceTicks } from '$lib/layout/scales/NiceTicks';

describe('NiceTicks.domain', () => {
	test('widens outward to the nearest nice step', () => {
		expect(NiceTicks.domain(0, 87, 5)).toEqual([0, 100]);
		expect(NiceTicks.domain(3, 47, 5)).toEqual([0, 50]);
	});

	test('a total meant to be exactly on a tick stays on it', () => {
		expect(NiceTicks.domain(0, 100.00000000000001, 5)).toEqual([0, 100]);
	});

	test('so do parts rounded at the source, adding up to a hair past the tick', () => {
		expect(NiceTicks.domain(0, 100.2, 5)).toEqual([0, 100]);
		expect(NiceTicks.domain(0, 100.5, 5)).toEqual([0, 100]);
		expect(NiceTicks.domain(-100.4, 0, 5)).toEqual([-100, 0]);
	});

	test('a tolerance of its own, or none at all', () => {
		expect(NiceTicks.domain(0, 100.2, 5, 0)).toEqual([0, 120]);
		expect(NiceTicks.domain(0, 104, 5, 0.25)).toEqual([0, 100]);
	});

	test('a value meaningfully past the tick still gets the next one', () => {
		expect(NiceTicks.domain(0, 102, 5)).toEqual([0, 120]);
	});

	test('an empty or inverted extent is returned as is', () => {
		expect(NiceTicks.domain(5, 5)).toEqual([5, 5]);
		expect(NiceTicks.domain(9, 1)).toEqual([9, 1]);
	});

	test('fit picks as many ticks as fit the axis at the plot size', () => {
		expect(NiceTicks.fit({ width: 400, height: 300 }, 'y', 0, 9)).toEqual([0, 10]);
		expect(NiceTicks.fit({ width: 400, height: 900 }, 'y', 0, 9)).toEqual([0, 9]);
	});
});
