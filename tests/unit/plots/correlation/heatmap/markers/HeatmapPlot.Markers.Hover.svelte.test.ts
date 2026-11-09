import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { PENGUIN_COUNTS } from '$datasets';
import { waitForSvg, countHoverAreas } from '../../../_helpers/svg';

const DATA_PROPS = {
	data: PENGUIN_COUNTS,
	x: 'island' as const,
	y: 'species' as const,
	color: 'count' as const
};

// Both of a heatmap's axes are band scales, so a band along each (unlike on a
// bar/pyramid chart, which only ever has one) can render together as a
// crosshair-shaped pair of highlight areas around the hovered cell.
// svelteplot's <Pointer> matches heatmap cells by nearest-point distance
// rather than a dedicated per-category hit area (see BarPlot's own hover
// test for why that makes simulating a real hover here impractical) - these
// tests exercise the marker's static (no-hover) baseline and its
// configuration surface only.
describe('HeatmapPlot - markers.hover bands', () => {
	test('renders with a band along each axis and shows no highlight before any hover', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			markers: [
				{
					type: 'hover',
					back: [
						{ type: 'band', axis: 'x', value: (p) => p.x },
						{ type: 'band', axis: 'y', value: (p) => p.y }
					]
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countHoverAreas(svg)).toBe(0);
	});

	test('does not crash with a styled band', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			markers: [
				{
					type: 'hover',
					back: [{ type: 'band', axis: 'x', value: (p) => p.x, styles: { fill: '#e11d48' } }]
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
