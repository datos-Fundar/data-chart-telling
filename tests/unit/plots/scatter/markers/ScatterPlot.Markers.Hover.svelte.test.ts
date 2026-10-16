import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { AMERICAS, COUNTRIES } from '../../../../../stories/plots/scatter/data';
import { waitForSvg, countDotMarks, countTextLabels } from '../../_helpers/svg';

// The hover marker's own dot/label only render on an actual cursor match,
// which needs real pointer events - these tests exercise the static
// (no-hover) baseline and the marker's configuration surface.
describe('ScatterPlot - markers.hover', () => {
	test('adds no extra dot/label before any hover', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: AMERICAS,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		// Only the base scatter dots - the hover marker itself renders nothing yet.
		expect(countDotMarks(svg)).toBe(AMERICAS.length);
		expect(countTextLabels(svg)).toBe(0);
	});

	test('does not crash when scoped to a single series', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			color: 'region',
			markers: [{ type: 'hover', series: 'Americas' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with custom dot/font style overrides', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: AMERICAS,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			markers: [
				{
					type: 'hover',
					dot: { dotRadius: 10, dotFill: '#dc2626' },
					text: { fontSize: 14 }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with ruleX/ruleY explicitly enabled', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: AMERICAS,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			markers: [{ type: 'hover', ruleX: true, ruleY: true }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
