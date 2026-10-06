import { describe, test, expect } from 'vitest';
import { inheritPlotGrouping } from '$lib/utils/markerGrouping';
import { markerAxisValues } from '$lib/utils/markerAxisValues';

describe('inheritPlotGrouping', () => {
	test('a grouping-capable marker inherits the plot’s grouping, falling back to its color', () => {
		const [density] = inheritPlotGrouping([{ type: 'density' }], { color: 'region' });
		expect((density as { grouping?: string }).grouping).toBe('region');
	});

	test('a marker’s own grouping is kept', () => {
		const [hull] = inheritPlotGrouping([{ type: 'hull', grouping: 'country' }], {
			color: 'region'
		});
		expect((hull as { grouping?: string }).grouping).toBe('country');
	});

	test('an explicit flat color keeps the marker ungrouped by color, but grouping still inherits', () => {
		const [dot] = inheritPlotGrouping([{ type: 'dot', styles: { dotFill: '#dc2626' } }], {
			color: 'region'
		});
		expect((dot as { color?: string }).color).toBeUndefined();
	});

	test('an ungrouped marker with no flat color inherits the plot color', () => {
		const [dot] = inheritPlotGrouping([{ type: 'dot' }], { color: 'region' });
		expect((dot as { color?: string }).color).toBe('region');
	});

	test('a line inherits both the grouping and the color, so each group’s line takes its color', () => {
		const [line] = inheritPlotGrouping([{ type: 'line' }], { color: 'region' });
		expect(line).toMatchObject({ grouping: 'region', color: 'region' });
	});

	test('a line with its own stroke keeps it, and only inherits the grouping', () => {
		const [line] = inheritPlotGrouping([{ type: 'line', styles: { stroke: '#111827' } }], {
			color: 'region'
		});
		expect((line as { color?: string }).color).toBeUndefined();
		expect((line as { grouping?: string }).grouping).toBe('region');
	});

	test('a series-scoped marker and a plot with no grouping are left untouched', () => {
		const scoped = { type: 'density', series: 'Americas' };
		expect(inheritPlotGrouping([scoped], { color: 'region' })[0]).toBe(scoped);
		const plain = { type: 'density' };
		expect(inheritPlotGrouping([plain], {})[0]).toBe(plain);
	});
});

describe('markerAxisValues', () => {
	test('collects finite values from a marker’s own data, skipping markers without data', () => {
		const values = markerAxisValues(
			[{ data: [{ v: 1 }, { v: 3 }], x: 'v', y: 'v' }, { x: 'v' }],
			'x'
		);
		expect(values).toEqual([1, 3]);
	});

	test('reads symbol-keyed transform output, as svelteplot’s own transforms produce', () => {
		const X = Symbol('x');
		const values = markerAxisValues([{ data: [{ [X]: 2 }, { [X]: 5 }], x: X }], 'x');
		expect(values).toEqual([2, 5]);
	});

	test('reads a range’s edges too, and a literal edge as is', () => {
		const values = markerAxisValues(
			[{ data: [{ lo: 2, mid: 3, hi: 4 }], y: 'mid', y1: 0, y2: 'hi', x1: 'lo' }],
			'y'
		);
		expect(values).toEqual([3, 0, 4]);
	});
});
