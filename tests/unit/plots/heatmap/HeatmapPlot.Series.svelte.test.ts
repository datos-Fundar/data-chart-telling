import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import {
	LIFE_EXPECTANCY_BY_PROVINCE_SEX,
	type ProvinceSexCell
} from '../../../../stories/plots/heatmap/data';
import { waitForSvg, countCells } from '../_helpers/svg';

describe('HeatmapPlot – series prop', () => {
	test('renders an SVG', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			series: [
				{
					name: 'life_expectancy',
					x: 'province',
					y: 'sex',
					color: 'value',
					data: LIFE_EXPECTANCY_BY_PROVINCE_SEX
				} satisfies Series<ProvinceSexCell>
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
					name: 'life_expectancy',
					x: 'province',
					y: 'sex',
					color: 'value',
					data: LIFE_EXPECTANCY_BY_PROVINCE_SEX
				} satisfies Series<ProvinceSexCell>
			]
		});
		const svg = await waitForSvg(container);
		expect(countCells(svg)).toBe(LIFE_EXPECTANCY_BY_PROVINCE_SEX.length);
	});

	test('does not crash with an empty data array', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			data: [] as ProvinceSexCell[],
			x: 'province',
			y: 'sex',
			color: 'value'
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});

describe('HeatmapPlot – data/x/y/color shorthand', () => {
	test('renders the same cells as the explicit series form', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
			x: 'province',
			y: 'sex',
			color: 'value'
		});
		const svg = await waitForSvg(container);
		expect(countCells(svg)).toBe(LIFE_EXPECTANCY_BY_PROVINCE_SEX.length);
	});
});
