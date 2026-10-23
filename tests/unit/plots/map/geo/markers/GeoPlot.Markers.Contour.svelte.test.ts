import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES } from '$datasets/world-countries';
import { waitForSvg, countContourPaths } from '../../../_helpers/svg';
import { WEATHER_STATIONS } from '$datasets';

describe('GeoPlot - contour marker', () => {
	test('scatter-interpolation mode renders contour paths without crashing', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			coordinates: { projection: 'mercator' },
			markers: [
				{
					type: 'contour',
					data: WEATHER_STATIONS,
					x: 'lon',
					y: 'lat',
					value: 'tempC',
					thresholds: 6
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countContourPaths(svg)).toBeGreaterThan(0);
	});

	test('explicit thresholds array renders without crashing', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			coordinates: { projection: 'mercator' },
			markers: [
				{
					type: 'contour',
					data: WEATHER_STATIONS,
					x: 'lon',
					y: 'lat',
					value: 'tempC',
					thresholds: [15, 20, 25, 30]
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countContourPaths(svg)).toBeGreaterThan(0);
	});

	test('fill: "value" renders without crashing', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			coordinates: { projection: 'mercator' },
			markers: [
				{
					type: 'contour',
					data: WEATHER_STATIONS,
					x: 'lon',
					y: 'lat',
					value: 'tempC',
					thresholds: 6,
					fill: 'value',
					blur: 2
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
