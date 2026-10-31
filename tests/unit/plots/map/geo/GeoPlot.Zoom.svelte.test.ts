import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import { WORLD_COUNTRIES } from '$datasets/world-countries';
import { WEATHER_STATIONS } from '$datasets';
import { waitForSvg } from '../../_helpers/svg';

async function drawn(k: number) {
	const { container } = render(GeoPlot, {
		width: 600,
		height: 400,
		data: WORLD_COUNTRIES,
		coordinates: { projection: 'mercator', zoom: { initial: { x: -100, y: -50, k } } },
		markers: [{ type: 'dot', data: WEATHER_STATIONS, x: 'lon', y: 'lat', r: 6 }]
	} as never);
	const svg = await waitForSvg(container);
	// The map is redrawn for a zoom once the view has been still for a moment
	await new Promise((resolve) => setTimeout(resolve, 300));
	const dot = svg.querySelector('g.dot path, path.dot, [class*=dot] path') as SVGGraphicsElement;
	const country = svg.querySelector('g[clip-path] path') as SVGGraphicsElement;
	return { dot: dot.getBBox(), countryWidth: country.getBBox().width };
}

describe('GeoPlot - zoom', () => {
	test('zooming spreads the map out while a dot keeps its size', async () => {
		const near = await drawn(1);
		const far = await drawn(4);
		expect(far.countryWidth).toBeGreaterThan(near.countryWidth * 2);
		expect(far.dot.width).toBeCloseTo(near.dot.width, 0);
	});
});
