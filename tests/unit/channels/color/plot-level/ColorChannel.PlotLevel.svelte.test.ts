import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { ArgentinaProvinceProps } from '../../../../../stories/plots/geo/data';
import { ARGENTINA_PROVINCES } from '../../../../../stories/plots/geo/data';
import { LIFE_EXPECTANCY_BY_PROVINCE_SEX } from '../../../../../stories/plots/heatmap/data';
import { waitForSvg, countCells, countGeoPaths } from '../../../plots/_helpers/svg';

function fillsOf(svg: SVGElement, selector: string): string[] {
	return Array.from(svg.querySelectorAll(selector)).map(
		(el) => el.getAttribute('fill') ?? el.getAttribute('style') ?? ''
	);
}

// A plot-level `color` accessor + `scales.color` is the same contract across
// every plot kind — these tests exercise it directly against two very
// different kinds (a categorical grid vs. a map) to guard the shared channel
// behavior, independent of either kind's own Styles/Scales test suite.
describe('color channel – plot level', () => {
	test('HeatmapPlot: a color accessor resolves each cell to its own fill', async () => {
		const { container } = render(HeatmapPlot, {
			width: 400,
			height: 300,
			data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
			x: 'province',
			y: 'sex',
			color: 'value'
		});
		const svg = await waitForSvg(container);
		expect(countCells(svg)).toBe(LIFE_EXPECTANCY_BY_PROVINCE_SEX.length);
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
			data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
			x: 'province',
			y: 'sex'
		});
		const heatmapSvg = await waitForSvg(heatmap.container);
		expect(new Set(fillsOf(heatmapSvg, 'g.cell rect')).size).toBe(1);

		const geo = render(GeoPlot, { width: 400, height: 300, data: ARGENTINA_PROVINCES });
		const geoSvg = await waitForSvg(geo.container);
		expect(new Set(fillsOf(geoSvg, 'g.geo path, path.geo')).size).toBe(1);
	});
});
