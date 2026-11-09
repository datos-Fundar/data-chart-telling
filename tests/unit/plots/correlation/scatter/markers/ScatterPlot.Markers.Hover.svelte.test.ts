import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES_AT_2007 } from '$datasets';
import { waitForSvg, countDotMarks, countTextLabels } from '../../../_helpers/svg';

// The hover marker's own dot/label only render on an actual cursor match,
// which needs real pointer events - these tests exercise the static
// (no-hover) baseline and the marker's configuration surface.
describe('ScatterPlot - markers.hover', () => {
	test('adds no extra dot/label before any hover', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		// Only the base scatter dots - the hover marker itself renders nothing yet.
		expect(countDotMarks(svg)).toBe(COUNTRIES_AT_2007.length);
		expect(countTextLabels(svg)).toBe(0);
	});

	test('does not crash when scoped to a single series', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			color: 'continent',
			markers: [{ type: 'hover', series: 'Americas' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with a dot and a label of its own in front', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			markers: [
				{
					type: 'hover',
					front: [
						{ type: 'dot', styles: { dotRadius: 10, dotFill: '#dc2626' } },
						{ type: 'text', text: (p) => p.label, styles: { fontSize: 14 } }
					]
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with a crosshair along each axis', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			markers: [
				{
					type: 'hover',
					back: [
						{ type: 'rule', axis: 'x', value: (p) => p.x, points: 'active' },
						{ type: 'rule', axis: 'y', value: (p) => p.y, points: 'active' }
					]
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
