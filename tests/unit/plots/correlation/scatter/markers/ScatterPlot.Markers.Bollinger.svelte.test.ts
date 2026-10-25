import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { BUENOS_AIRES_TEMPERATURE, DAILY_TEMPERATURE } from '$datasets';
import { waitForSvg } from '../../../_helpers/svg';

const base = {
	width: 500,
	height: 300,
	data: BUENOS_AIRES_TEMPERATURE,
	x: 'date',
	y: 'temp',
	scales: { x: { type: 'time' as const } }
};

describe('ScatterPlot - markers.bollinger', () => {
	test('with no `x`, `y` or `data` of its own, it draws the average and its band over the plot rows', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [{ type: 'bollinger' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => svg.querySelectorAll('g.bollinger path').length).toBeGreaterThan(1);
		expect(svg.outerHTML).not.toContain('NaN');
	});

	test('its own `x` and `y` win over the plot', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [{ type: 'bollinger', x: 'date', y: 'rain' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => svg.querySelectorAll('g.bollinger path').length).toBeGreaterThan(1);
	});

	test('with a `grouping`, each group is drawn as a band of its own', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			data: DAILY_TEMPERATURE,
			color: 'city',
			markers: [{ type: 'bollinger', grouping: 'city' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => svg.querySelectorAll('g.bollinger').length).toBe(2);
	});
});
