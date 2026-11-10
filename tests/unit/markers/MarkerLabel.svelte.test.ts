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
	test('a label inside its shape with no fill of its own contrasts with each shape', async () => {
		const svg = await draw(HeatmapPlot as never, {
			data: [],
			x: 'col',
			y: 'row',
			markers: [
				{
					type: 'cell',
					data: [
						{ col: 'Mon', row: 'AM', value: 3, tone: '#1f2a44' },
						{ col: 'Tue', row: 'AM', value: 7, tone: '#f4f1de' }
					],
					x: 'col',
					y: 'row',
					styles: { fill: 'tone' },
					label: { text: 'value' }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const fillOf = (text: string) =>
			[...svg.querySelectorAll<SVGTextElement>('g.text text')].find(
				(t) => t.textContent?.trim() === text
			)?.style.fill;
		await expect.poll(() => fillOf('3')).toBe('rgb(255, 255, 255)');
		await expect.poll(() => fillOf('7')).toBe('rgb(17, 24, 39)');
	});

	test('a faded shape is read as it is seen: blended with the background', async () => {
		const svg = await draw(HeatmapPlot as never, {
			data: [],
			x: 'col',
			y: 'row',
			markers: [
				{
					type: 'cell',
					data: [{ col: 'Mon', row: 'AM', value: 3 }],
					x: 'col',
					y: 'row',
					styles: { fill: '#1f2a44', fillOpacity: 0.15 },
					label: { text: 'value' }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const fill = () => svg.querySelector<SVGTextElement>('g.text text')?.style.fill;
		await expect.poll(fill).toBe('rgb(17, 24, 39)');
	});

	test('a marker writes each label of a list, the ones on its shape contrasting with it', async () => {
		const svg = await draw(HeatmapPlot as never, {
			data: [],
			x: 'col',
			y: 'row',
			markers: [
				{
					type: 'cell',
					data: [{ col: 'Mon', row: 'AM', value: 3, name: 'Monday' }],
					x: 'col',
					y: 'row',
					styles: { fill: '#1f2a44' },
					label: [
						{ text: 'value', anchor: 'top' },
						{ text: 'name', anchor: 'bottom', styles: { fill: 'white' } }
					]
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const fillOf = (text: string) =>
			[...svg.querySelectorAll<SVGTextElement>('g.text text')].find(
				(t) => t.textContent?.trim() === text
			)?.style.fill;
		await expect.poll(() => fillOf('3')).toBe('rgb(255, 255, 255)');
		await expect.poll(() => fillOf('Monday')).toBe('white');
	});

	test('the point labels of several markers spread apart together', async () => {
		const line = (name: string, end: number) => ({
			type: 'line' as const,
			data: [
				{ t: 1, v: 0, name },
				{ t: 2, v: end, name }
			],
			x: 't',
			y: 'v',
			label: { text: 'name', select: 'last' as const, declutter: true, styles: { dx: 6 } }
		});
		const svg = await draw(LinePlot, {
			data: [],
			x: 't',
			y: 'v',
			markers: [line('first', 10), line('second', 10.1), line('third', 10.2)]
		});
		await expect
			.poll(() => [...svg.querySelectorAll('text')].map((t) => t.textContent?.trim()))
			.toEqual(expect.arrayContaining(['first', 'second', 'third']));
		await expect
			.poll(() => svg.querySelectorAll('path[fill="none"][d^="M"][d*="V"]').length)
			.toBe(3);
	});

	test("a point label on a bar starts at the bar's top", async () => {
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
					styles: { fill: 'purple' },
					label: { ...label, layout: 'point', anchor: 'top', gap: 0 }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		await expect.poll(() => written(svg).sort()).toEqual(['6', '9']);
		const texts = [...svg.querySelectorAll<SVGTextElement>('text')].filter(
			(t) => t.style.fill === 'white'
		);
		const tops = [...svg.querySelectorAll('g.bar-y rect')]
			.map((bar) => bar.getBoundingClientRect().top)
			.sort((a, b) => a - b);
		const bottoms = texts.map((t) => t.getBoundingClientRect().bottom).sort((a, b) => a - b);
		expect(bottoms).toHaveLength(2);
		// Sitting on the top, its descent aside.
		bottoms.forEach((bottom, i) => expect(Math.abs(bottom - tops[i])).toBeLessThan(6));
	});
});
