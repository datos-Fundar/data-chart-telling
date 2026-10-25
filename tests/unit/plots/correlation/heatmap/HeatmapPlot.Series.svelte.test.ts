import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { PENGUIN_COUNTS, type PenguinSpeciesCount } from '$datasets';
import { waitForSvg, countCells } from '../../_helpers/svg';

describe('HeatmapPlot - series prop', () => {
	test('renders an SVG', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			series: [
				{
					name: 'penguins',
					x: 'island',
					y: 'species',
					color: 'count',
					data: PENGUIN_COUNTS
				} satisfies Series<PenguinSpeciesCount>
			]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('renders one cell per data row', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			series: [
				{
					name: 'penguins',
					x: 'island',
					y: 'species',
					color: 'count',
					data: PENGUIN_COUNTS
				} satisfies Series<PenguinSpeciesCount>
			]
		});
		const svg = await waitForSvg(container);
		expect(countCells(svg)).toBe(PENGUIN_COUNTS.length);
	});

	test('does not crash with an empty data array', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			data: [] as PenguinSpeciesCount[],
			x: 'island',
			y: 'species',
			color: 'count'
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});

describe('HeatmapPlot - data/x/y/color shorthand', () => {
	test('renders the same cells as the explicit series form', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			data: PENGUIN_COUNTS,
			x: 'island',
			y: 'species',
			color: 'count'
		});
		const svg = await waitForSvg(container);
		expect(countCells(svg)).toBe(PENGUIN_COUNTS.length);
	});
});
