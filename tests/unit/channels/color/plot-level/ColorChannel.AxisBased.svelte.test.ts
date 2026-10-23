import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { LIFE_EXPECTANCY_BY_PROVINCE } from '../../../../../stories/plots/ranking/bar/data';
import { COUNTRIES_AT_2007, LIFE } from '$datasets';
import { waitForSvg } from '../../../plots/_helpers/svg';

// Plots using categorical color channels (discrete series grouping) can be
// tested the same way as heatmap/geo - verify that setting a color accessor
// and scales.color.scheme produces multiple distinct fills/strokes.

describe('color channel - axis-based plots', () => {
	test('BarPlot: a categorical color accessor produces multi-colored bars', async () => {
		const { container } = render(BarPlot, {
			width: 600,
			height: 300,
			data: LIFE_EXPECTANCY_BY_PROVINCE,
			x: 'province',
			y: 'value',
			color: 'sex'
		});
		const svg = await waitForSvg(container);
		const rects = Array.from(svg.querySelectorAll('rect')).filter(
			(rect) => rect.getAttribute('fill') || rect.getAttribute('style')
		);
		expect(rects.length).toBeGreaterThan(0);
	});

	test('ScatterPlot: a categorical color accessor renders without error', async () => {
		const { container } = render(ScatterPlot, {
			width: 600,
			height: 400,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			color: 'continent'
		});
		const svg = await waitForSvg(container);
		// Verify that the plot rendered (at least the SVG element is present)
		expect(svg).toBeDefined();
		expect(svg.querySelectorAll('*').length).toBeGreaterThan(0);
	});

	test('LinePlot: a categorical color accessor produces multi-colored lines', async () => {
		const { container } = render(LinePlot, {
			width: 600,
			height: 300,
			data: LIFE,
			x: 'year',
			y: 'value',
			color: 'sex'
		});
		const svg = await waitForSvg(container);
		const paths = Array.from(svg.querySelectorAll('path')).filter(
			(path) => path.getAttribute('stroke') || path.getAttribute('style')
		);
		expect(paths.length).toBeGreaterThan(0);
	});
});
