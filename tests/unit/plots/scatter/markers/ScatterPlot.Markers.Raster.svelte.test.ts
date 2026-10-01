import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../../../../stories/plots/scatter/data';
import { waitForSvg, countRasterMarks } from '../../_helpers/svg';

describe('ScatterPlot – markers.raster', () => {
	test('function-sampling mode (empty data) renders one raster', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'x',
			y: 'y',
			scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } },
			markers: [
				{
					type: 'raster',
					data: [],
					x1: 0,
					x2: 10,
					y1: 0,
					y2: 10,
					fill: (x: number, y: number) => Math.sin(x) * Math.cos(y)
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countRasterMarks(svg)).toBe(1);
		expect(svg.outerHTML).not.toContain('NaN');
	});

	test('scatter-interpolation mode renders one raster from rows', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			markers: [
				{
					type: 'raster',
					x: 'gdpPerCapita',
					y: 'lifeExpectancy',
					fill: 'population',
					interpolate: 'nearest'
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countRasterMarks(svg)).toBe(1);
	});
});
