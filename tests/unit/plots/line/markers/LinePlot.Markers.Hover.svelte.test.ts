import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import { FEMALE_LIFE_EXPECTANCY, LIFE_EXPECTANCY } from '../../../../../stories/plots/line/data';
import { waitForSvg, countDotMarks, countTextLabels } from '../../_helpers/svg';

const FEMALE = {
	name: 'female',
	x: 'year' as const,
	y: 'value' as const,
	data: FEMALE_LIFE_EXPECTANCY
};

// The hover marker's dot/label/rules only appear once svelteplot's <Pointer>
// reports a match, which requires a real cursor position over the rendered
// marks. These tests exercise the marker's static (no-hover) baseline and
// its configuration surface — not the interactive matching itself.
describe('LinePlot – markers.hover', () => {
	test('renders with a basic hover marker and shows nothing before any hover', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(0);
		expect(countTextLabels(svg)).toBe(0);
	});

	test('does not crash when scoped to a single series', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			data: LIFE_EXPECTANCY,
			x: 'year',
			y: 'value',
			color: 'sex',
			markers: [{ type: 'hover', series: 'female' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with scope "segment" over a segmented series', async () => {
		const segments: SegmentsConfig<LineSegmentStyle> = {
			female: [
				{ areas: [{ x: { to: 2014 } }], styles: {} },
				{ areas: [{ x: { from: 2014 } }], styles: { stroke: { strokeDasharray: '6 4' } } }
			]
		};
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			segments,
			markers: [{ type: 'hover', series: 'female', scope: 'segment' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with ruleX/ruleY explicitly disabled', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover', ruleX: false, ruleY: false }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with custom dot/font/rule style overrides', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [
				{
					type: 'hover',
					dot: { dotRadius: 6, dotFill: '#e11d48' },
					text: { fontSize: 14 },
					rule: { strokeDasharray: '2 2' }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with a custom label format', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [
				{
					type: 'hover',
					format: (point) => `${point.x}: ${point.y}`
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
