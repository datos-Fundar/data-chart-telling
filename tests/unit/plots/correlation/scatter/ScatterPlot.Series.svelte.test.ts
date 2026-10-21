import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { AMERICAS, COUNTRIES } from '../../../../../stories/plots/correlation/scatter/data';
import { waitForSvg, countDotMarks } from '../../_helpers/svg';

describe('ScatterPlot - series', () => {
	test('renders one dot per row for a single series', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: AMERICAS,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy'
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(AMERICAS.length);
	});

	test('renders one dot per row across every group when color is given', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			color: 'region'
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(COUNTRIES.length);
	});

	test('renders the same dot count from a pre-built series array', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			series: [{ name: 'Americas', x: 'gdpPerCapita', y: 'lifeExpectancy', data: AMERICAS }]
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(AMERICAS.length);
	});

	test('two regions render distinct fill colors by default', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			color: 'region'
		});
		const svg = await waitForSvg(container);
		const fills = new Set(
			[...svg.querySelectorAll('g.dot path')].map((p) => p.getAttribute('style'))
		);
		expect(fills.size).toBeGreaterThan(1);
	});
});
