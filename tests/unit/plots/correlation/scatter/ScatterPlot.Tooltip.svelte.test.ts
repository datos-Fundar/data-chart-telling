import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { CountryYearRow } from '$datasets';
import { COUNTRIES_AT_2007 } from '$datasets';
import { waitForSvg } from '../../_helpers/svg';

function noTooltipDom(container: Element) {
	return container.querySelector('.dct-tooltip, [class*="tooltip"]');
}

describe('ScatterPlot - tooltip', () => {
	test('no floating tooltip appears without a tooltip config', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life'
		});
		await waitForSvg(container);
		expect(noTooltipDom(container)).toBeNull();
	});

	test('no floating tooltip appears before any hover, even with a tooltip config', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			tooltip: {
				sync: false,
				format: (row) => `${(row as CountryYearRow).country}`
			}
		});
		await waitForSvg(container);
		expect(noTooltipDom(container)).toBeNull();
	});

	test('renders with a grouped-data (data/x/y/color) tooltip config', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			color: 'continent',
			tooltip: {
				sync: false,
				format: (row) => `${(row as CountryYearRow).country}: ${(row as CountryYearRow).life} yr`
			}
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('renders with a series-filtered tooltip config', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			color: 'continent',
			tooltip: {
				sync: false,
				series: ['Americas'],
				format: (row) => `${(row as CountryYearRow).country}`
			}
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
