import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { CountryPoint } from '../../../../stories/plots/scatter/data';
import { AMERICAS } from '../../../../stories/plots/scatter/data';
import { waitForSvg, countDotMarks } from '../_helpers/svg';

describe('ScatterPlot - bubble sizing (r)', () => {
	test('a constant r does not crash and keeps one dot per row', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: AMERICAS,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			r: 8
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(AMERICAS.length);
	});

	test('a field-key r varies dot geometry by row', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: AMERICAS,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			r: 'population'
		});
		const svg = await waitForSvg(container);
		const ds = new Set([...svg.querySelectorAll('g.dot path')].map((p) => p.getAttribute('d')));
		// Distinct populations across AMERICAS should produce more than one radius.
		expect(ds.size).toBeGreaterThan(1);
	});

	test('an accessor-function r produces the same dot count as no r at all', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: AMERICAS,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			r: (d) => Math.sqrt((d as CountryPoint).population)
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(AMERICAS.length);
	});
});
