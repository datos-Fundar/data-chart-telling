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
});
