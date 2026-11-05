import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { waitForSvg } from '../plots/_helpers/svg';

const label = { text: 'value', styles: { fill: 'white', fontSize: 14 } };

/** The texts a marker wrote in white, by what they say. */
const written = (svg: SVGElement) =>
	[...svg.querySelectorAll<SVGTextElement>('text')]
		.filter((t) => t.style.fill === 'white')
		.map((t) => t.textContent?.trim());

const CELLS = [
	{ col: 'Mon', row: 'AM', value: 3 },
	{ col: 'Tue', row: 'AM', value: 7 }
];
const BARS = [
	{ category: 'A', value: 6 },
	{ category: 'B', value: 9 }
];

async function draw(Plot: typeof LinePlot, props: Record<string, unknown>) {
	const { container } = await render(Plot, { width: 400, height: 300, ...props } as never);
	return waitForSvg(container);
}

describe('markers with a label', () => {
	test('a cell writes its label in the middle of the cell', async () => {
		const svg = await draw(HeatmapPlot as never, {
			data: [],
			x: 'col',
			y: 'row',
			markers: [
				{ type: 'cell', data: CELLS, x: 'col', y: 'row', styles: { fill: 'purple' }, label }
			] satisfies AxisBasedMarkersConfig[]
		});
		await expect.poll(() => written(svg).sort()).toEqual(['3', '7']);
	});

	test('a bar writes its label in the middle of the bar', async () => {
		const svg = await draw(BarPlot as never, {
			data: [],
			x: 'category',
			y: 'value',
			markers: [
				{
					type: 'bar',
					role: 'segment',
					isHorizontal: false,
					data: BARS,
					x: 'category',
					y1: 0,
					y2: 'value',
					label
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		await expect.poll(() => written(svg).sort()).toEqual(['6', '9']);
	});

	test('a bar too short for its label leaves it out', async () => {
		const svg = await draw(BarPlot as never, {
			data: [],
			x: 'category',
			y: 'value',
			scales: { y: { domain: [0, 1000] } },
			markers: [
				{
					type: 'bar',
					role: 'segment',
					isHorizontal: false,
					data: [{ category: 'A', value: 1 }],
					x: 'category',
					y1: 0,
					y2: 'value',
					label
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		await new Promise((resolve) => setTimeout(resolve, 150));
		expect(written(svg)).toEqual([]);
	});
});
