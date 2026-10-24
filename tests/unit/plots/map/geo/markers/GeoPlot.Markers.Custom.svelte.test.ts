import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES } from '$datasets/world-countries';
import { waitForSvg, countDotMarks, countTextLabels } from '../../../_helpers/svg';
import { WEATHER_STATIONS, type WeatherStation } from '$datasets';

describe('GeoPlot - custom component marker', () => {
	test('mounts DotMarker with lon/lat accessors', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			coordinates: { projection: 'mercator' },
			markers: [
				{
					type: 'dot',
					data: WEATHER_STATIONS,
					x: (d: WeatherStation) => d.lon,
					y: (d: WeatherStation) => d.lat
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(WEATHER_STATIONS.length);
	});

	test('mounts TextMarker with lon/lat accessors', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			coordinates: { projection: 'mercator' },
			markers: [
				{
					type: 'text',
					data: WEATHER_STATIONS,
					x: (d: WeatherStation) => d.lon,
					y: (d: WeatherStation) => d.lat,
					text: (d: WeatherStation) => d.city
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(WEATHER_STATIONS.length);
	});

	test('offsets each text label by its own dx/dy under a projection', async () => {
		const rows = [
			{ name: 'above', dy: -20 },
			{ name: 'below', dy: 20 }
		];
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			coordinates: { projection: 'mercator' },
			markers: [
				{
					type: 'text',
					data: rows,
					x: () => 0,
					y: () => 0,
					text: 'name',
					dx: 10,
					dy: (d: { dy: number }) => d.dy
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const label = (name: string) =>
			Array.from(svg.querySelectorAll('text')).find((el) => el.textContent?.trim() === name)!;
		const above = label('above').getBoundingClientRect();
		const below = label('below').getBoundingClientRect();
		expect(below.top - above.top).toBeCloseTo(40, 0);
	});

	test('falls back to the base map features when no `data` override is given', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			markers: [
				{
					type: 'dot',
					x: () => 0,
					y: () => 0
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(WORLD_COUNTRIES.length);
	});
});
