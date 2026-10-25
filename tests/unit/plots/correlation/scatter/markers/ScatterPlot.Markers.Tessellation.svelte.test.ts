import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES_AT_2007 } from '$datasets';
import {
	waitForSvg,
	countDelaunayLinkPaths,
	countDelaunayMeshPaths,
	countVoronoiPaths,
	countVoronoiMeshPaths
} from '../../../_helpers/svg';

const base = {
	width: 400,
	height: 300,
	data: COUNTRIES_AT_2007,
	x: 'gdp',
	y: 'life'
};
const channels = { x: 'gdp', y: 'life' };

describe('ScatterPlot - markers.delaunay / voronoi', () => {
	test('delaunayLink draws one path per triangulation edge', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [{ type: 'delaunayLink', ...channels }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countDelaunayLinkPaths(svg)).toBeGreaterThan(COUNTRIES_AT_2007.length);
	});

	test('delaunayMesh draws the whole triangulation as a single path', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [{ type: 'delaunayMesh', ...channels }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countDelaunayMeshPaths(svg)).toBe(1);
	});

	test('voronoi draws one cell per point', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [{ type: 'voronoi', ...channels }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countVoronoiPaths(svg)).toBe(COUNTRIES_AT_2007.length);
	});

	test('voronoiMesh draws the whole diagram as a single path', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [{ type: 'voronoiMesh', ...channels }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countVoronoiMeshPaths(svg)).toBe(1);
	});

	test('`grouping` computes one mesh per group', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [
				{ type: 'voronoiMesh', ...channels, grouping: 'continent' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countVoronoiMeshPaths(svg)).toBe(
			new Set(COUNTRIES_AT_2007.map((d) => d.continent)).size
		);
	});

	test('`color` resolves through the palette into stroke', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [
				{ type: 'voronoi', ...channels, color: 'continent' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const strokes = new Set(
			[...svg.querySelectorAll('g.voronoi path')].map((p) => p.getAttribute('style') ?? '')
		);
		expect(strokes.size).toBeGreaterThan(1);
	});
});
