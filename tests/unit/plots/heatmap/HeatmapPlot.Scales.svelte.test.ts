import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import {
	LIFE_EXPECTANCY_BY_PROVINCE_SEX,
	PROVINCES,
	SEXES
} from '../../../../stories/plots/heatmap/data';
import { waitForSvg, countCells } from '../_helpers/svg';

const DATA_PROPS = {
	data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
	x: 'province' as const,
	y: 'sex' as const,
	color: 'value' as const
};

describe('HeatmapPlot - scales', () => {
	test('renders with no scale overrides (auto domain)', async () => {
		const { container } = await render(HeatmapPlot, { width: 400, height: 300, ...DATA_PROPS });
		const svg = await waitForSvg(container);
		expect(countCells(svg)).toBe(LIFE_EXPECTANCY_BY_PROVINCE_SEX.length);
	});

	test('an explicit X domain pins the axis ticks to that exact order', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			scales: { x: { domain: PROVINCES } } satisfies AxisBasedScalesConfig
		});
		const svg = await waitForSvg(container);
		const ticks = Array.from(svg.querySelectorAll('g.axis-x text')).map((t) => t.textContent);
		expect(ticks).toEqual(PROVINCES);
	});

	test('an explicit Y domain pins the axis ticks to that exact order', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			scales: { y: { domain: SEXES } } satisfies AxisBasedScalesConfig
		});
		const svg = await waitForSvg(container);
		const ticks = Array.from(svg.querySelectorAll('g.axis-y text')).map((t) => t.textContent);
		expect(ticks).toEqual(SEXES);
	});

	test('reversed Y axis flips the pixel position of a given tick', async () => {
		async function yPositionOf(tick: string, reverse: boolean) {
			const { container } = await render(HeatmapPlot, {
				width: 400,
				height: 300,
				...DATA_PROPS,
				scales: { y: { reverse } } satisfies AxisBasedScalesConfig
			});
			const svg = await waitForSvg(container);
			const label = Array.from(svg.querySelectorAll('g.axis-y text')).find(
				(t) => t.textContent === tick
			);
			return label?.getAttribute('y') ?? label?.closest('[transform]')?.getAttribute('transform');
		}
		const normal = await yPositionOf(SEXES[0], false);
		const reversed = await yPositionOf(SEXES[0], true);
		expect(normal).toBeTruthy();
		expect(reversed).toBeTruthy();
		expect(normal).not.toBe(reversed);
	});

	test('axis labels render the configured title text', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			scales: { x: { label: 'Province' }, y: { label: 'Sex' } } satisfies AxisBasedScalesConfig,
			margins: { bottom: 50, left: 100 }
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelector('.axis-x-title')?.textContent).toContain('Province');
		expect(svg.querySelector('.axis-y-title')?.textContent).toContain('Sex');
	});
});
