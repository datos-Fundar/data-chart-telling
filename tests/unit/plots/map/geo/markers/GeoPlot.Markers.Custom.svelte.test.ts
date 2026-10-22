import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES } from '../../../../../../stories/plots/map/geo/data';
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
