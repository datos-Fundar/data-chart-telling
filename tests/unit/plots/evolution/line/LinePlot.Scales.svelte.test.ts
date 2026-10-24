import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import { FEMALE_LIFE } from '$datasets';
import { waitForSvg, countLinePaths } from '../../_helpers/svg';

const SERIES = [{ name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE }];

describe('LinePlot - scales', () => {
	test('renders with no scale overrides (auto domain)', async () => {
		const { container } = await render(LinePlot, { width: 400, height: 300, series: SERIES });
		const svg = await waitForSvg(container);
		expect(countLinePaths(svg)).toBe(1);
	});

	test('a custom Y domain does not break rendering', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: SERIES,
			scales: { y: { domain: [55, 85] } } satisfies AxisBasedScalesConfig
		});
		const svg = await waitForSvg(container);
		expect(countLinePaths(svg)).toBe(1);
	});

	test('a custom X domain filters ticks but still renders the line', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [
				{
					name: 'female',
					x: 'year',
					y: 'value',
					data: FEMALE_LIFE.filter((d) => d.year >= 1972 && d.year <= 2019)
				}
			],
			scales: { x: { domain: [1972, 2019] } } satisfies AxisBasedScalesConfig
		});
		const svg = await waitForSvg(container);
		expect(countLinePaths(svg)).toBe(1);
	});

	test('reversed Y axis flips the pixel position of a given tick', async () => {
		async function yPositionOf(tick: string, reverse: boolean) {
			const { container } = await render(LinePlot, {
				width: 400,
				height: 300,
				series: SERIES,
				scales: { y: { reverse } } satisfies AxisBasedScalesConfig
			});
			const svg = await waitForSvg(container);
			const label = Array.from(svg.querySelectorAll('g.axis-y text')).find(
				(t) => t.textContent === tick
			);
			return label?.getAttribute('y') ?? label?.closest('[transform]')?.getAttribute('transform');
		}
		const normal = await yPositionOf('70', false);
		const reversed = await yPositionOf('70', true);
		expect(normal).toBeTruthy();
		expect(reversed).toBeTruthy();
		expect(normal).not.toBe(reversed);
	});

	test('explicit tick values pin the X axis ticks', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: SERIES,
			scales: { x: { ticks: [1950, 1970, 2010] } } satisfies AxisBasedScalesConfig
		});
		const svg = await waitForSvg(container);
		const ticks = Array.from(svg.querySelectorAll('g.axis-x text')).map((t) => t.textContent);
		expect(ticks).toEqual(['1950', '1970', '2010']);
	});

	test('a custom Y tick formatter changes the rendered tick labels', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: SERIES,
			scales: {
				y: { ticks: [80], tickFormat: () => 'custom' }
			} satisfies AxisBasedScalesConfig
		});
		const svg = await waitForSvg(container);
		const ticks = Array.from(svg.querySelectorAll('g.axis-y text')).map((t) => t.textContent);
		expect(ticks).toEqual(['custom']);
	});

	test('grid: true adds gridlines on the Y axis', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: SERIES,
			scales: { y: { grid: true } } satisfies AxisBasedScalesConfig
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.grid-y line').length).toBeGreaterThan(0);
	});

	test('without grid, no gridlines are rendered', async () => {
		const { container } = await render(LinePlot, { width: 400, height: 300, series: SERIES });
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.grid-y line').length).toBe(0);
	});

	test('a plot with no rows keeps the axis titles its rows would have given', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			data: [] as { year: number; value: number }[],
			x: 'year',
			y: 'value',
			scales: { x: { domain: [1990, 2000] }, y: { domain: [0, 10] } }
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelector('.axis-y-title')?.textContent).toContain('value');
		expect(svg.querySelector('.axis-x-title')?.textContent).toContain('year');
	});

	test('a plot with no rows still titles its vertical y axis, once', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			data: [] as { year: number; value: number }[],
			x: 'year',
			y: 'value',
			scales: {
				x: { domain: [1990, 2000] },
				y: { domain: [0, 10], labelOrientation: 'vertical' }
			},
			margins: { left: 60 }
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelector('.axis-y-title')).toBeFalsy();
		const titles = [...svg.querySelectorAll('text')].filter((t) => t.textContent === 'value');
		expect(titles.length).toBe(1);
	});

	test("a vertical custom y label suppresses svelteplot's own native title, instead of both rendering", async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: SERIES,
			scales: {
				y: { label: 'Life expectancy (years)', labelOrientation: 'vertical', labelPosition: 'top' }
			} satisfies AxisBasedScalesConfig,
			margins: { left: 60 }
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelector('.axis-y-title')).toBeFalsy();
		const customLabel = [...svg.querySelectorAll('text')].find(
			(t) => t.textContent === 'Life expectancy (years)'
		);
		expect(customLabel).toBeTruthy();
	});

	test('a whole-number x axis (years) never ticks between two values, however wide the plot', async () => {
		const data = [2018, 2019, 2020, 2021, 2022].map((year, i) => ({ year, value: 60 + i }));
		const { container } = await render(LinePlot, {
			width: 680,
			height: 300,
			data,
			x: 'year',
			y: 'value'
		});
		const svg = await waitForSvg(container);
		const ticks = Array.from(svg.querySelectorAll('g.axis-x text')).map((t) => t.textContent);
		expect(ticks).toEqual(['2018', '2019', '2020', '2021', '2022']);
	});
});
