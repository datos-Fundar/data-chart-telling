import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { COUNTRIES_AT_2007 } from '$datasets';
import { waitForSvg, countDotMarks } from '../../_helpers/svg';

describe('ScatterPlot - series', () => {
	test('renders one dot per row for a single series', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life'
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(COUNTRIES_AT_2007.length);
	});

	test('renders one dot per row across every group when color is given', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			color: 'continent'
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(COUNTRIES_AT_2007.length);
	});

	test('renders the same dot count from a pre-built series array', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			series: [{ name: 'Countries', x: 'gdp', y: 'life', data: COUNTRIES_AT_2007 }]
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(COUNTRIES_AT_2007.length);
	});

	test('two continents render distinct fill colors by default', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			color: 'continent'
		});
		const svg = await waitForSvg(container);
		const fills = new Set(
			[...svg.querySelectorAll('g.dot path')].map((p) => p.getAttribute('style'))
		);
		expect(fills.size).toBeGreaterThan(1);
	});
});
