import { render } from 'vitest-browser-svelte';
import { describe, expect, test, vi } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { waitForSvg } from '../plots/_helpers/svg';

const DATA = [
	{ cat: 'A', series: 'female', value: 10 },
	{ cat: 'A', series: 'male', value: 20 },
	{ cat: 'B', series: 'female', value: 15 },
	{ cat: 'B', series: 'male', value: 5 }
];
const props = {
	width: 400,
	height: 300,
	data: DATA,
	x: 'cat',
	y: 'value',
	color: 'series'
} as const;

const bands = (svg: SVGElement) => Array.from(svg.querySelectorAll<SVGRectElement>('g.band rect'));
const bars = (svg: SVGElement) =>
	Array.from(svg.querySelectorAll<SVGRectElement>('g.bar-y rect')).filter(
		(r) => !r.classList.contains('dct-hit-area')
	);
const boxOf = (el: Element) => el.getBoundingClientRect();
const columnOf = (svg: SVGElement, index: number) => {
	// The two bars of a category, side by side, span its band but for its padding.
	const sorted = bars(svg)
		.map(boxOf)
		.sort((a, b) => a.left - b.left);
	return sorted.slice(index * 2, index * 2 + 2);
};

describe('the band marker', () => {
	test('fills the band of its category across the whole value axis, in the configured look', async () => {
		const { container } = await render(BarPlot, {
			...props,
			markers: [{ type: 'band', axis: 'x', value: 'B' }]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => bands(svg).length).toBe(1);
		const band = boxOf(bands(svg)[0]);
		const [first, second] = columnOf(svg, 1);
		expect(band.left).toBeLessThanOrEqual(first.left);
		expect(band.right).toBeGreaterThanOrEqual(second.right);
		// Across the whole value axis: as tall as the tallest bar at least.
		const tallest = Math.max(...bars(svg).map((b) => boxOf(b).height));
		expect(band.height).toBeGreaterThanOrEqual(tallest);
		expect(bands(svg)[0].getAttribute('fill')).toBe('#94a3b8');
		expect(bands(svg)[0].getAttribute('fill-opacity')).toBe('0.25');
	});

	test('draws a band per category of its rows, one for a category several share', async () => {
		const { container } = await render(BarPlot, {
			...props,
			markers: [{ type: 'band', axis: 'x', data: DATA, value: 'cat' }]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => bands(svg).length).toBe(2);
	});

	test('a slice fills that part of the band only', async () => {
		const { container } = await render(BarPlot, {
			...props,
			markers: [
				{ type: 'band', axis: 'x', value: 'A', slice: { start: 0.5, end: 0 } },
				{ type: 'band', axis: 'x', value: 'B' }
			]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => bands(svg).length).toBe(2);
		const [half, whole] = bands(svg).map(boxOf);
		expect(half.width).toBeCloseTo(whole.width / 2, 0);
	});

	test('takes a style as a function of its row, and its handlers', async () => {
		const onclick = vi.fn();
		const { container } = await render(BarPlot, {
			...props,
			markers: [
				{
					type: 'band',
					axis: 'x',
					data: [
						{ cat: 'A', tint: 'red' },
						{ cat: 'B', tint: 'blue' }
					],
					value: 'cat',
					styles: { fill: (row: { tint: string }) => row.tint, strokeDasharray: 'dashed' },
					onclick
				}
			]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => bands(svg).length).toBe(2);
		expect(bands(svg).map((b) => b.getAttribute('fill'))).toEqual(['red', 'blue']);
		expect(bands(svg)[0].getAttribute('stroke-dasharray')).toBe('6 4');
		bands(svg)[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(onclick).toHaveBeenCalledWith(expect.any(Event), { cat: 'B', tint: 'blue' }, 1);
	});

	test('takes no pointer without a handler of its own', async () => {
		const { container } = await render(BarPlot, {
			...props,
			markers: [{ type: 'band', axis: 'x', value: 'A' }]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => bands(svg).length).toBe(1);
		expect(svg.querySelector('g.band')!.getAttribute('pointer-events')).toBe('none');
	});

	test('runs across a horizontal plot on y', async () => {
		const { container } = await render(BarPlot, {
			...props,
			x: 'value',
			y: 'cat',
			markers: [{ type: 'band', axis: 'y', value: 'A' }]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => bands(svg).length).toBe(1);
		const band = boxOf(bands(svg)[0]);
		expect(band.width).toBeGreaterThan(band.height);
	});

	test('draws nothing on an axis that is not a band scale', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			data: [
				{ x: 1, y: 1 },
				{ x: 2, y: 3 }
			],
			x: 'x',
			y: 'y',
			markers: [{ type: 'band', axis: 'x', value: 1 }]
		});
		const svg = await waitForSvg(container);
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(bands(svg)).toHaveLength(0);
	});
});
