import { describe, test, expect } from 'vitest';
import { EdgeTicks } from '$lib/layout/scales/EdgeTicks';
import type { EdgeTickCollision } from '$lib/types/layout/scales';

// Life expectancy census years: 1947 sits 3 years before the 1950 tick, too
// close for both labels on a 640px axis; 2019 sits 9 years after 2010, clear of it.
const YEARS = [1947, 1965, 1972, 1980, 1991, 2001, 2009, 2019];

const build = (values: number[], collision: EdgeTickCollision = 'drop-nice', enabled = true) =>
	EdgeTicks.build({
		axis: 'x',
		values,
		span: 640,
		spacing: 80,
		min: 3,
		fontSize: 14,
		options: { enabled, collision }
	});

describe('EdgeTicks.build', () => {
	test('adds the first and last values beside the nice ticks when they have room', () => {
		expect(build([1945, ...YEARS.slice(1)])).toEqual({
			ticks: [1945, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2019]
		});
	});

	test('an edge on a nice tick adds nothing', () => {
		expect(build([1950, 1980, 2010])).toEqual({
			ticks: [1950, 1960, 1970, 1980, 1990, 2000, 2010]
		});
	});

	test("'drop-nice' keeps the crowding edge and drops the nice tick next to it", () => {
		expect(build(YEARS, 'drop-nice')).toEqual({
			ticks: [1947, 1960, 1970, 1980, 1990, 2000, 2010, 2019]
		});
	});

	test("'drop-edge' keeps the nice tick and drops the crowding edge", () => {
		expect(build(YEARS, 'drop-edge')).toEqual({
			ticks: [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2019]
		});
	});

	test("'extend' widens the axis to the next nice tick past the crowding edge", () => {
		expect(build(YEARS, 'extend')).toEqual({
			ticks: [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2019],
			domain: [1940, 2019]
		});
	});

	test('a strategy only applies to the side that crowds', () => {
		const crowdedEnd = [1950, 1980, 2012];
		expect(build(crowdedEnd, 'extend')).toEqual({
			ticks: [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020],
			domain: [1950, 2020]
		});
	});

	test('off, or with values that span nothing, it leaves the ticks to the axis', () => {
		expect(build(YEARS, 'drop-nice', false)).toBeUndefined();
		expect(build([2000])).toBeUndefined();
		expect(build([2000, 2000])).toBeUndefined();
	});
});

describe('EdgeTicks.build on a y axis', () => {
	const build = (values: number[], span: number, collision: EdgeTickCollision = 'drop-nice') =>
		EdgeTicks.build({
			axis: 'y',
			values,
			span,
			spacing: 50,
			min: 2,
			fontSize: 14,
			options: { enabled: true, collision }
		});

	test('stacked labels crowd only within a line height, whatever their width', () => {
		// 61.4 to 80.2 over 150px, ticks every 5: 61.4 sits 29px below 65, 80.2 under 2px above 80.
		expect(build([61.4, 70, 80.2], 150)).toEqual({ ticks: [61.4, 65, 70, 75, 80.2] });
		expect(build([61.4, 70, 80.2], 150, 'extend')).toEqual({
			ticks: [61.4, 65, 70, 75, 80, 85],
			domain: [61.4, 85]
		});
	});
});

describe('EdgeTicks.resolve', () => {
	const configured = { enabled: true, collision: 'drop-nice' as const };

	test('without a plot option, the configuration decides', () => {
		expect(EdgeTicks.resolve(undefined, configured)).toEqual(configured);
	});

	test('a boolean turns them on or off, keeping the configured strategy', () => {
		expect(EdgeTicks.resolve(false, configured)).toEqual({
			enabled: false,
			collision: 'drop-nice'
		});
		expect(EdgeTicks.resolve(true, { ...configured, enabled: false })).toEqual(configured);
	});

	test('an object turns them on, with its own strategy or the configured one', () => {
		expect(EdgeTicks.resolve({ collision: 'extend' }, { ...configured, enabled: false })).toEqual({
			enabled: true,
			collision: 'extend'
		});
		expect(EdgeTicks.resolve({}, configured)).toEqual(configured);
	});
});
