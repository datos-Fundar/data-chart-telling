import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES, AMERICAS } from '../../../../../../stories/plots/correlation/scatter/data';
import { waitForSvg, countHullPaths } from '../../../_helpers/svg';

describe('ScatterPlot - markers.hull', () => {
	test('renders one hull around a cluster of points', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			markers: [
				{ type: 'hull', data: AMERICAS, x: 'gdpPerCapita', y: 'lifeExpectancy' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countHullPaths(svg)).toBe(1);
	});

	test('a hull scoped to one series wraps only that series from the plot data', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			color: 'region',
			markers: [
				{ type: 'hull', series: 'Americas', x: 'gdpPerCapita', y: 'lifeExpectancy' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countHullPaths(svg)).toBe(1);
	});

	test('grouping by `grouping` draws one hull per group', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			markers: [
				{ type: 'hull', x: 'gdpPerCapita', y: 'lifeExpectancy', grouping: 'region' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const regionCount = new Set(COUNTRIES.map((d) => d.region)).size;
		expect(countHullPaths(svg)).toBe(regionCount);
	});

	test('does not crash with an empty markers array', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			markers: []
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
