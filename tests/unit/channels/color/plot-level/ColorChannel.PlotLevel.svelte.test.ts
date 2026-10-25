import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import { type ArgentinaProvinceProps, ARGENTINA_PROVINCES } from '$datasets/argentina-provinces';
import { PENGUIN_COUNTS } from '$datasets';
import { waitForSvg, countCells, countGeoPaths } from '../../../plots/_helpers/svg';

function fillsOf(svg: SVGElement, selector: string): string[] {
	return Array.from(svg.querySelectorAll(selector)).map(
		(el) => el.getAttribute('fill') ?? el.getAttribute('style') ?? ''
	);
}

// A plot-level `color` accessor + `scales.color` is the same contract across
// every plot kind - these tests exercise it directly against two very
// different kinds (a categorical grid vs. a map) to guard the shared channel
// behavior, independent of either kind's own Styles/Scales test suite.
describe('color channel - plot level', () => {
	test('HeatmapPlot: a color accessor resolves each cell to its own fill', async () => {
		const { container } = render(HeatmapPlot, {
			width: 400,
			height: 300,
			data: PENGUIN_COUNTS,
			x: 'island',
			y: 'species',
			color: 'count'
		});
		const svg = await waitForSvg(container);
		expect(countCells(svg)).toBe(PENGUIN_COUNTS.length);
		const fills = fillsOf(svg, 'g.cell rect');
		expect(new Set(fills).size).toBeGreaterThan(1);
	});

	test('GeoPlot: a color accessor resolves each feature to its own fill', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			color: (f) => (f.properties as ArgentinaProvinceProps).population
		});
		const svg = await waitForSvg(container);
		expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);
		const fills = fillsOf(svg, 'g.geo path, path.geo');
		expect(new Set(fills).size).toBeGreaterThan(1);
	});

	test('no color accessor falls back to a single flat fill on both kinds', async () => {
		const heatmap = render(HeatmapPlot, {
			width: 400,
			height: 300,
			data: PENGUIN_COUNTS,
			x: 'island',
			y: 'species'
		});
		const heatmapSvg = await waitForSvg(heatmap.container);
		expect(new Set(fillsOf(heatmapSvg, 'g.cell rect')).size).toBe(1);

		const geo = render(GeoPlot, { width: 400, height: 300, data: ARGENTINA_PROVINCES });
		const geoSvg = await waitForSvg(geo.container);
		expect(new Set(fillsOf(geoSvg, 'g.geo path, path.geo')).size).toBe(1);
	});
});
