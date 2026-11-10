import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import type { LinePlotProps } from '$lib/types/plots/evolution/line/props';
import {
	FEMALE_LIFE,
	MALE_LIFE,
	COUNTRIES_AT_2007,
	PENGUIN_COUNTS,
	PROVINCE_VALUES
} from '$datasets';
import { waitForSvg, countTextLabels } from '../plots/_helpers/svg';

const SERIES = [
	{ name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE },
	{ name: 'male', x: 'year' as const, y: 'value' as const, data: MALE_LIFE }
];
const BARS = { data: COUNTRIES_AT_2007.slice(0, 6), x: 'country', y: 'life' };
const textPaths = (svg: SVGElement) => [...svg.querySelectorAll('textPath')];

describe('styles.values - show', () => {
	test('any option of the labels turns them on', async () => {
		const { container } = await render(LinePlot, {
			width: 500,
			height: 300,
			series: SERIES,
			styles: { values: { decimals: 1 } }
		});
		await expect.poll(async () => countTextLabels(await waitForSvg(container))).toBe(2);
	});

	test('`show: false` keeps them off whatever else is set', async () => {
		const { container } = await render(LinePlot, {
			width: 500,
			height: 300,
			series: SERIES,
			styles: { values: { show: false, decimals: 1 } }
		});
		const svg = await waitForSvg(container);
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(countTextLabels(svg)).toBe(0);
	});
});

describe('styles.values - layout', () => {
	test("a line plot's `'path'` labels write each series' name along its line", async () => {
		const { container } = await render(LinePlot, {
			width: 500,
			height: 300,
			series: SERIES,
			styles: { values: { layout: 'path' } }
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => textPaths(svg).map((p) => p.textContent)).toEqual(['female', 'male']);
		expect(countTextLabels(svg)).toBe(0);
	});

	test("a bar plot's `'point'` labels write only the rows `select` picks", async () => {
		const { container } = await render(BarPlot, {
			width: 500,
			height: 300,
			...BARS,
			styles: { values: { layout: 'point', select: 'max' } }
		});
		const svg = await waitForSvg(container);
		const top = Math.max(...BARS.data.map((d) => d.life));
		await expect
			.poll(() => [...svg.querySelectorAll('g.text text')].map((t) => t.textContent))
			.toEqual([String(top)]);
	});

	test("a scatter plot's `'path'` labels go around each dot's rim", async () => {
		const { container } = await render(ScatterPlot, {
			width: 500,
			height: 300,
			data: COUNTRIES_AT_2007.slice(0, 5),
			x: 'gdp',
			y: 'life',
			styles: { values: { layout: 'path' } }
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => textPaths(svg).length).toBe(5);
	});

	test('a plot takes only the layouts its shapes write', () => {
		const line: LinePlotProps<Record<string, unknown>>['styles'] = {
			// @ts-expect-error A line plot writes no box labels.
			values: { layout: 'box' }
		};
		expect(line).toBeTruthy();
	});

	test("a heatmap's `select` compares its cells' colors", async () => {
		const { container } = await render(HeatmapPlot, {
			width: 500,
			height: 300,
			data: PENGUIN_COUNTS,
			x: 'island',
			y: 'species',
			color: 'count',
			styles: { values: { layout: 'point', select: 'max' } }
		});
		const svg = await waitForSvg(container);
		const top = Math.max(...PENGUIN_COUNTS.map((d) => d.count));
		await expect
			.poll(() => [...svg.querySelectorAll('g.text text')].map((t) => t.textContent))
			.toEqual([String(top)]);
	});

	test("`color: 'series'` writes a label past its bar in its series' color", async () => {
		const { container } = await render(BarPlot, {
			width: 500,
			height: 300,
			data: PROVINCE_VALUES,
			x: 'province',
			y: 'value',
			color: 'sex',
			styles: { values: { color: 'series' } }
		});
		const svg = await waitForSvg(container);
		await expect
			.poll(
				() =>
					new Set([...svg.querySelectorAll('g.text text')].map((t) => getComputedStyle(t).fill))
						.size
			)
			.toBe(2);
	});
});
