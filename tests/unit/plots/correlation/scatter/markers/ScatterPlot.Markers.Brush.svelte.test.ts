import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES_AT_2007 } from '$datasets';
import { waitForSvg, countBrushSelections } from '../../../_helpers/svg';

const base = { width: 400, height: 300, data: COUNTRIES_AT_2007, x: 'gdp', y: 'life' };

describe('ScatterPlot - markers.brush', () => {
	test('with no initial selection it draws nothing until the user drags', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [{ type: 'brush' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countBrushSelections(svg)).toBe(0);
		expect(svg.querySelector('rect.frame')).toBeTruthy();
	});

	test('a seeded, enabled selection draws the brush rectangle', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [
				{
					type: 'brush',
					brush: { enabled: true, x1: 10, x2: 50, y1: 65, y2: 80 }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countBrushSelections(svg)).toBe(1);
		expect(svg.outerHTML).not.toContain('NaN');
	});

	test("`limitDimension` 'x' keeps only the horizontal range", async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [
				{
					type: 'brush',
					limitDimension: 'x',
					brush: { enabled: true, x1: 10, x2: 50 }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const rect = svg.querySelector('rect.brush-rect')!;
		expect(Number(rect.getAttribute('height'))).toBeGreaterThan(200);
		expect(svg.outerHTML).not.toContain('NaN');
	});
});
