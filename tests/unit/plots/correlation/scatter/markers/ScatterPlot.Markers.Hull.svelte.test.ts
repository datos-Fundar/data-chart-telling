import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES_AT_2007 } from '$datasets';
import { waitForSvg, countHullPaths } from '../../../_helpers/svg';

describe('ScatterPlot - markers.hull', () => {
	test('renders one hull around a cluster of points', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			markers: [
				{ type: 'hull', data: COUNTRIES_AT_2007, x: 'gdp', y: 'life' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countHullPaths(svg)).toBe(1);
	});

	test('a hull scoped to one series wraps only that series from the plot data', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			color: 'continent',
			markers: [
				{ type: 'hull', series: 'Americas', x: 'gdp', y: 'life' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countHullPaths(svg)).toBe(1);
	});

	test('grouping by `grouping` draws one hull per group', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			markers: [
				{ type: 'hull', x: 'gdp', y: 'life', grouping: 'continent' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const continentCount = new Set(COUNTRIES_AT_2007.map((d) => d.continent)).size;
		expect(countHullPaths(svg)).toBe(continentCount);
	});

	test('does not crash with an empty markers array', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			markers: []
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
