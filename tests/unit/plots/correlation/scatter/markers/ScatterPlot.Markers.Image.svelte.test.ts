import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES_AT_2007 } from '$datasets';
import { waitForSvg, countImageMarks } from '../../../_helpers/svg';

const PIXEL = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>';
const base = { width: 400, height: 300, data: COUNTRIES_AT_2007, x: 'gdp', y: 'life' };

describe('ScatterPlot - markers.image', () => {
	test('renders one image per row, at the resolved `src`', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [
				{ type: 'image', x: 'gdp', y: 'life', src: PIXEL }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countImageMarks(svg)).toBe(COUNTRIES_AT_2007.length);
		expect(svg.querySelector('image')?.getAttribute('href')).toBe(PIXEL);
	});

	test('`src` accepts a per-row function and `width`/`height` size it', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [
				{
					type: 'image',
					x: 'gdp',
					y: 'life',
					src: (d: { continent: string }) => `${PIXEL}#${d.continent}`,
					width: 30,
					height: 12
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const first = svg.querySelector('image')!;
		expect(first.getAttribute('href')).toContain(`#${COUNTRIES_AT_2007[0].continent}`);
		expect(first.getAttribute('width')).toBe('30');
		expect(first.getAttribute('height')).toBe('12');
	});

	test('a `series`-scoped image reuses that series from the plot data', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			color: 'continent',
			markers: [
				{ type: 'image', series: 'Europe', x: 'gdp', y: 'life', src: PIXEL }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countImageMarks(svg)).toBe(
			COUNTRIES_AT_2007.filter((d) => d.continent === 'Europe').length
		);
	});
});
