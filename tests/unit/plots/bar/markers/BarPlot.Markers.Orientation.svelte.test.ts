import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import HistogramPlot from '$lib/plots/histogram/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { waitForSvg } from '../../_helpers/svg';

const DATA = [
	{ province: 'A', value: 3 },
	{ province: 'B', value: 5 }
];

// An orientation-sensitive marker runs the way the plot itself runs, read off its axes.
describe('markers - the plot decides which way they run', () => {
	test('a tick on categories along x is a TickY, and along y a TickX', async () => {
		const tick = (x: string, y: string) =>
			[{ type: 'tick', data: DATA, x, y }] satisfies AxisBasedMarkersConfig[];
		const vertical = render(BarPlot, {
			width: 400,
			height: 300,
			data: DATA,
			x: 'province',
			y: 'value',
			markers: tick('province', 'value')
		});
		const verticalSvg = await waitForSvg(vertical.container);
		expect(verticalSvg.querySelectorAll('g.tick-y').length).toBe(1);
		expect(verticalSvg.querySelectorAll('g.tick-x').length).toBe(0);

		const horizontal = render(BarPlot, {
			width: 400,
			height: 300,
			data: DATA,
			x: 'value',
			y: 'province',
			markers: tick('value', 'province')
		});
		const horizontalSvg = await waitForSvg(horizontal.container);
		expect(horizontalSvg.querySelectorAll('g.tick-x').length).toBe(1);
		expect(horizontalSvg.querySelectorAll('g.tick-y').length).toBe(0);
	});

	test('a histogram given only y runs along y, though neither of its axes is a band', async () => {
		const { container } = render(HistogramPlot, {
			width: 400,
			height: 300,
			data: [{ v: 1 }, { v: 4 }, { v: 12 }],
			y: 'v',
			markers: [
				{ type: 'tick', data: [{ v: 3, n: 1 }], x: 'n', y: 'v' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.tick-x').length).toBe(1);
	});
});
