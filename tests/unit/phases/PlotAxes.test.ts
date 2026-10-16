import { describe, test, expect, vi, afterEach } from 'vitest';
import { PlotAxes } from '$lib/phases/data/PlotAxes';

type Row = Record<string, unknown>;

const ROWS: Row[] = [
	{ name: 'A', year: 2020, value: 10, date: new Date(2020, 0, 1) },
	{ name: 'B', year: 2021, value: 20, date: new Date(2021, 0, 1) }
];

/** One series over `ROWS` reading these channels. */
const over = (channels: { x?: string; y?: string }) => [{ ...channels, data: ROWS }];

afterEach(() => vi.restoreAllMocks());

describe('PlotAxes.build - each axis kind', () => {
	test('reads strings as categories, dates as time, numbers as a range', () => {
		const axes = PlotAxes.build({ series: over({ x: 'name', y: 'value' }) });
		expect(axes.x).toEqual({ kind: 'discrete', origin: 'inferred' });
		expect(axes.y).toEqual({ kind: 'continuous', origin: 'inferred' });
		expect(PlotAxes.build({ series: over({ x: 'date', y: 'value' }) }).x?.kind).toBe('temporal');
	});

	test("an author's scales type wins over the values", () => {
		const axes = PlotAxes.build({
			series: over({ x: 'name', y: 'year' }),
			scales: { x: { type: 'linear' }, y: { type: 'band' } }
		});
		expect(axes.x).toEqual({ kind: 'continuous', origin: 'explicit' });
		expect(axes.y).toEqual({ kind: 'discrete', origin: 'explicit' });
	});

	test('a channel no series sets stays out', () => {
		const axes = PlotAxes.build({ series: over({ x: 'value' }) });
		expect(axes.y).toBeUndefined();
	});
});

describe('PlotAxes.build - one category axis', () => {
	test('categories on x are vertical, on y horizontal', () => {
		const vertical = PlotAxes.build({ series: over({ x: 'name', y: 'value' }), discrete: 1 });
		expect(vertical).toMatchObject({ category: 'x', value: 'y', orientation: 'vertical' });
		const horizontal = PlotAxes.build({ series: over({ x: 'value', y: 'name' }), discrete: 1 });
		expect(horizontal).toMatchObject({ category: 'y', value: 'x', orientation: 'horizontal' });
		expect(horizontal.isHorizontal).toBe(true);
	});

	test('with two numeric axes, x is promoted to the category axis', () => {
		const axes = PlotAxes.build({ series: over({ x: 'year', y: 'value' }), discrete: 1 });
		expect(axes).toMatchObject({ category: 'x', x: { kind: 'discrete', origin: 'promoted' } });
	});

	test('a time axis is promoted before a numeric one, wherever it is', () => {
		const axes = PlotAxes.build({ series: over({ x: 'value', y: 'date' }), discrete: 1 });
		expect(axes).toMatchObject({ category: 'y', orientation: 'horizontal' });
	});

	test('two category axes warn and fall back to categories on x', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const axes = PlotAxes.build({ series: over({ x: 'name', y: 'name' }), discrete: 1 });
		expect(axes.category).toBe('x');
		expect(warn).toHaveBeenCalledOnce();
	});
});

describe('PlotAxes.build - no or two category axes', () => {
	test('a heatmap promotes both axes', () => {
		const axes = PlotAxes.build({ series: over({ x: 'year', y: 'name' }), discrete: 2 });
		expect(axes.x).toEqual({ kind: 'discrete', origin: 'promoted' });
		expect(axes.y?.kind).toBe('discrete');
	});

	test('a single channel runs along itself: y alone is horizontal, measured on x', () => {
		const axes = PlotAxes.build({ series: over({ y: 'value' }) });
		expect(axes).toMatchObject({ value: 'x', orientation: 'horizontal' });
		expect(PlotAxes.build({ series: over({ x: 'value' }) })).toMatchObject({
			value: 'y',
			orientation: 'vertical'
		});
	});

	test('two free axes are horizontal only when y holds positions and x a range', () => {
		expect(PlotAxes.build({ series: over({ x: 'date', y: 'value' }) }).orientation).toBe(
			'vertical'
		);
		expect(PlotAxes.build({ series: over({ x: 'value', y: 'name' }) })).toMatchObject({
			orientation: 'horizontal',
			value: 'x',
			category: 'y'
		});
	});
});

describe('PlotAxes.build - bands', () => {
	test('are the axes the kind lays out as categories: one, both, or none', () => {
		expect(PlotAxes.build({ series: over({ x: 'name', y: 'value' }), discrete: 1 }).bands).toEqual([
			'x'
		]);
		expect(PlotAxes.build({ series: over({ x: 'value', y: 'name' }), discrete: 1 }).bands).toEqual([
			'y'
		]);
		expect(PlotAxes.build({ series: over({ x: 'year', y: 'name' }), discrete: 2 }).bands).toEqual([
			'x',
			'y'
		]);
	});

	test('are none for a kind that asks for no category axis, even over a string axis', () => {
		const axes = PlotAxes.build({ series: over({ x: 'name', y: 'value' }) });
		expect(axes.x?.kind).toBe('discrete');
		expect(axes.bands).toEqual([]);
	});
});

describe('PlotAxes.build - channels the plot gives', () => {
	test('count as active without a series carrying them, so an explicit type still decides', () => {
		const axes = PlotAxes.build({
			series: [],
			scales: { y: { type: 'band' } },
			given: { x: true, y: true },
			discrete: 1
		});
		expect(axes).toMatchObject({ category: 'y', value: 'x', orientation: 'horizontal' });
		expect(axes.bands).toEqual(['y']);
	});
});

describe('PlotAxes - roles', () => {
	test('resolve maps a role to its axis, a name to itself', () => {
		const axes = PlotAxes.build({ series: over({ x: 'value', y: 'name' }), discrete: 1 });
		expect(axes.resolve('value')).toBe('x');
		expect(axes.resolve('category')).toBe('y');
		expect(axes.resolve('y')).toBe('y');
	});

	test('a state without axes measures along y and sorts into x', () => {
		expect(PlotAxes.valueOf({})).toBe('y');
		expect(PlotAxes.categoryOf({})).toBe('x');
	});
});
