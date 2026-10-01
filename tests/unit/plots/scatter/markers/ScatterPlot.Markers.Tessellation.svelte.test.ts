import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../../../../stories/plots/scatter/data';
import {
	waitForSvg,
	countDelaunayLinkPaths,
	countDelaunayMeshPaths,
	countVoronoiPaths,
	countVoronoiMeshPaths
} from '../../_helpers/svg';

const base = {
	width: 400,
	height: 300,
	data: COUNTRIES,
	x: 'gdpPerCapita',
	y: 'lifeExpectancy'
};
const channels = { x: 'gdpPerCapita', y: 'lifeExpectancy' };

describe('ScatterPlot – markers.delaunay / voronoi', () => {
	test('delaunayLink draws one path per triangulation edge', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [{ type: 'delaunayLink', ...channels }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countDelaunayLinkPaths(svg)).toBeGreaterThan(COUNTRIES.length);
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
		expect(countVoronoiPaths(svg)).toBe(COUNTRIES.length);
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
				{ type: 'voronoiMesh', ...channels, grouping: 'region' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countVoronoiMeshPaths(svg)).toBe(new Set(COUNTRIES.map((d) => d.region)).size);
	});

	test('`color` resolves through the palette into stroke', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [
				{ type: 'voronoi', ...channels, color: 'region' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const strokes = new Set(
			[...svg.querySelectorAll('g.voronoi path')].map((p) => p.getAttribute('style') ?? '')
		);
		expect(strokes.size).toBeGreaterThan(1);
	});
});
