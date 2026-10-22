import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import { PENGUIN_COUNTS, PENGUIN_ISLANDS, PENGUIN_SPECIES } from '$datasets';
import { waitForSvg, countCells } from '../../_helpers/svg';

const DATA_PROPS = {
	data: PENGUIN_COUNTS,
	x: 'island' as const,
	y: 'species' as const,
	color: 'count' as const
};

describe('HeatmapPlot - scales', () => {
	test('renders with no scale overrides (auto domain)', async () => {
		const { container } = await render(HeatmapPlot, { width: 400, height: 300, ...DATA_PROPS });
		const svg = await waitForSvg(container);
		expect(countCells(svg)).toBe(PENGUIN_COUNTS.length);
	});

	test('an explicit X domain pins the axis ticks to that exact order', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			scales: { x: { domain: PENGUIN_ISLANDS } } satisfies AxisBasedScalesConfig
		});
		const svg = await waitForSvg(container);
		const ticks = Array.from(svg.querySelectorAll('g.axis-x text')).map((t) => t.textContent);
		expect(ticks).toEqual(PENGUIN_ISLANDS);
	});

	test('an explicit Y domain pins the axis ticks to that exact order', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			scales: { y: { domain: PENGUIN_SPECIES } } satisfies AxisBasedScalesConfig
		});
		const svg = await waitForSvg(container);
		const ticks = Array.from(svg.querySelectorAll('g.axis-y text')).map((t) => t.textContent);
		expect(ticks).toEqual(PENGUIN_SPECIES);
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
		const normal = await yPositionOf(PENGUIN_SPECIES[0], false);
		const reversed = await yPositionOf(PENGUIN_SPECIES[0], true);
		expect(normal).toBeTruthy();
		expect(reversed).toBeTruthy();
		expect(normal).not.toBe(reversed);
	});

	test('axis labels render the configured title text', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			scales: { x: { label: 'Island' }, y: { label: 'Species' } } satisfies AxisBasedScalesConfig,
			margins: { bottom: 50, left: 100 }
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelector('.axis-x-title')?.textContent).toContain('Island');
		expect(svg.querySelector('.axis-y-title')?.textContent).toContain('Species');
	});
});
