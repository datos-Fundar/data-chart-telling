import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import { resolveOpacityScale } from '$lib/utils/opacity';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, WEATHER_STATIONS } from '../../../../stories/plots/geo/data';
import { waitForSvg } from '../../plots/_helpers/svg';

function dotOpacitiesOf(svg: SVGElement): number[] {
	return Array.from(svg.querySelectorAll('g.dot path')).map((el) => {
		const style = el.getAttribute('style') ?? '';
		const match = style.match(/fill-opacity:\s*([\d.]+)/);
		return match ? Number(match[1]) : NaN;
	});
}

describe('opacity channel - marker level (dot)', () => {
	test('a dot marker with its own opacity channel renders multiple exact buckets, independent of the plot', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			coordinates: { projection: 'mercator' },
			markers: [
				{
					type: 'dot',
					data: WEATHER_STATIONS,
					x: 'lon',
					y: 'lat',
					r: 8,
					opacity: 'tempC',
					scales: { opacity: { domain: [-10, 30], range: [0.1, 1] } }
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const opacities = dotOpacitiesOf(svg);
		expect(opacities.length).toBe(WEATHER_STATIONS.length);

		const scale = resolveOpacityScale({ domain: [-10, 30], range: [0.1, 1] }, [-10, 30], [0.2, 1]);
		const expected = new Set(WEATHER_STATIONS.map((s) => Math.round(scale(s.tempC) * 32) / 32));
		const rendered = new Set(opacities.map((o) => Math.round(o * 32) / 32));
		expect(rendered).toEqual(expected);
		// More than one bucket - proves it isn't silently collapsing to one flat opacity.
		expect(rendered.size).toBeGreaterThan(1);
	});
});
