import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { LIFE_EXPECTANCY_BY_PROVINCE_SEX } from '../../../../../stories/plots/correlation/heatmap/data';
import { waitForSvg, countCells, countTextLabels } from '../../_helpers/svg';

const DATA_PROPS = {
	data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
	x: 'province' as const,
	y: 'sex' as const,
	color: 'value' as const
};

function cellFills(svg: SVGElement): string[] {
	return Array.from(svg.querySelectorAll('g.cell rect')).map((r) => r.getAttribute('style') ?? '');
}

describe('HeatmapPlot - styles.values', () => {
	test('value labels render by default, one per cell, showing the raw value', async () => {
		const { container } = await render(HeatmapPlot, { width: 400, height: 300, ...DATA_PROPS });
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(LIFE_EXPECTANCY_BY_PROVINCE_SEX.length);
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		expect(labels).toEqual(
			expect.arrayContaining(LIFE_EXPECTANCY_BY_PROVINCE_SEX.map((d) => String(d.value)))
		);
	});

	test('values.show: false hides the value labels', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			styles: { values: { show: false } } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(0);
		expect(countCells(svg)).toBe(LIFE_EXPECTANCY_BY_PROVINCE_SEX.length);
	});

	test('a custom format callback overrides the default label text', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			styles: {
				values: { format: (v: number) => `${v.toFixed(1)} yr` }
			} satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		expect(labels).toEqual(
			expect.arrayContaining(LIFE_EXPECTANCY_BY_PROVINCE_SEX.map((d) => `${d.value.toFixed(1)} yr`))
		);
	});
});

describe('HeatmapPlot - scales.color', () => {
	test('a custom color ramp changes the rendered cell fill colors', async () => {
		const defaultRender = await render(HeatmapPlot, { width: 400, height: 300, ...DATA_PROPS });
		const defaultSvg = await waitForSvg(defaultRender.container);
		const defaultFills = cellFills(defaultSvg);

		const customRender = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			scales: { color: { scheme: ['#ff6b6b', '#51cf66'] } }
		});
		const customSvg = await waitForSvg(customRender.container);
		const customFills = cellFills(customSvg);

		expect(defaultFills.length).toBe(LIFE_EXPECTANCY_BY_PROVINCE_SEX.length);
		expect(customFills.length).toBe(LIFE_EXPECTANCY_BY_PROVINCE_SEX.length);
		expect(customFills).not.toEqual(defaultFills);
	});
});
