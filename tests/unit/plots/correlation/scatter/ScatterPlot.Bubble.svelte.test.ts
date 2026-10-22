import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { CountryYearRow } from '$datasets';
import { waitForSvg, countDotMarks } from '../../_helpers/svg';

import { COUNTRIES_AT_2007 } from '$datasets';

describe('ScatterPlot - bubble sizing (r)', () => {
	test('a constant r does not crash and keeps one dot per row', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			r: 8
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(COUNTRIES_AT_2007.length);
	});

	test('a field-key r varies dot geometry by row', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			r: 'population'
		});
		const svg = await waitForSvg(container);
		const ds = new Set([...svg.querySelectorAll('g.dot path')].map((p) => p.getAttribute('d')));
		// Distinct populations across COUNTRIES_AT_2007 should produce more than one radius.
		expect(ds.size).toBeGreaterThan(1);
	});

	test('an accessor-function r produces the same dot count as no r at all', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			r: (d) => Math.sqrt((d as CountryYearRow).population)
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(COUNTRIES_AT_2007.length);
	});
});
