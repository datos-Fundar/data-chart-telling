import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES_AT_2007 } from '$datasets';
import { waitForSvg, countDensityPaths } from '../../../_helpers/svg';

describe('ScatterPlot - markers.density', () => {
	test('renders filled contour bands', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			markers: [{ type: 'density', x: 'gdp', y: 'life' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countDensityPaths(svg)).toBeGreaterThan(0);
	});

	test('grouping by `grouping` renders more contour paths than the ungrouped estimate', async () => {
		const ungrouped = (
			await render(ScatterPlot, {
				width: 400,
				height: 300,
				data: COUNTRIES_AT_2007,
				x: 'gdp',
				y: 'life',
				markers: [
					{ type: 'density', x: 'gdp', y: 'life', thresholds: 4 }
				] satisfies AxisBasedMarkersConfig[]
			})
		).container;
		const grouped = (
			await render(ScatterPlot, {
				width: 400,
				height: 300,
				data: COUNTRIES_AT_2007,
				x: 'gdp',
				y: 'life',
				markers: [
					{
						type: 'density',
						x: 'gdp',
						y: 'life',
						grouping: 'continent',
						thresholds: 4
					}
				] satisfies AxisBasedMarkersConfig[]
			})
		).container;
		const before = countDensityPaths(await waitForSvg(ungrouped));
		const after = countDensityPaths(await waitForSvg(grouped));
		expect(after).toBeGreaterThan(before);
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
