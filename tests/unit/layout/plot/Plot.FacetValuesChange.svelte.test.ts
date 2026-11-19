import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';

const REGIONS = ['A', 'B', 'C', 'D', 'E'];
const DATA = REGIONS.flatMap((region, r) =>
	[1, 2, 3].map((year) => ({ year, region, value: year * 10 * (r + 1) }))
);

const props = (values: string[]) => ({
	width: 900,
	height: 300,
	data: DATA,
	x: 'year',
	y: 'value',
	color: 'region',
	facet: {
		by: 'region',
		columns: 3,
		scales: 'shared' as const,
		axes: 'all' as const,
		gap: 24,
		mode: 'grid' as const,
		values
	},
	timeline: {
		accessor: 'year',
		progress: 2,
		type: 'rule' as const,
		show: false,
		filterMode: 'upTo' as const,
		interpolate: false,
		values: [1, 2, 3]
	}
});

describe('Plot - facet values change', () => {
	test('a panel that replaces a dropped one draws its plot', async () => {
		const { container, rerender } = await render(LinePlot, props(['A', 'B', 'C']));
		await vi.waitFor(() => expect(container.querySelectorAll('.dct-plot svg').length).toBe(3));

		await rerender(props(['B', 'C', 'D']));

		await vi.waitFor(() => {
			expect(container.querySelectorAll('.dct-grid-cell').length).toBe(3);
			expect(container.querySelectorAll('.dct-plot svg').length).toBe(3);
		});
	});
});
