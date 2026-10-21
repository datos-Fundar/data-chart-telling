import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import type { GeoFeature } from '$lib/types/plots/data/geo';
import { ARGENTINA_PROVINCES } from '../../../../../../stories/plots/map/geo/data';
import { waitForSvg, countGeoPaths } from '../../../_helpers/svg';

const DATA_PROPS = {
	data: ARGENTINA_PROVINCES,
	featureId: (f: GeoFeature) => (f.properties as { nombre: string }).nombre
};

// The hover marker only restyles a feature on an actual cursor match via
// SVG hit-testing, which needs real pointer events - these tests only assert
// the static/no-hover baseline (no extra overlay path) and that varied
// configs don't crash, mirroring the same boundary BarPlot's/HeatmapPlot's
// hover marker tests already draw.

describe('GeoPlot - hover marker (static baseline)', () => {
	test('no overlay path before any hover', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			markers: [{ type: 'geo-hover' }] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);
	});

	test('custom style does not crash', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			markers: [
				{
					type: 'geo-hover',
					styles: { fill: '#facc15', fillOpacity: 0.4, stroke: '#7f1d1d', strokeWidth: 3 }
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with an empty markers array', async () => {
		const { container } = render(GeoPlot, { width: 400, height: 300, ...DATA_PROPS, markers: [] });
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
