import { render } from 'vitest-browser-svelte';
import { describe, test, expect, afterEach, vi } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import {
	FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
	LIFE_EXPECTANCY_BY_PROVINCE
} from '../../../../../stories/plots/bar/data';
import { waitForSvg, countDotMarks, countTextLabels, countHoverAreas } from '../../_helpers/svg';

const FEMALE = {
	name: 'female',
	x: 'province' as const,
	y: 'value' as const,
	data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
};

/** Dispatches a centered `pointerenter` on the first per-category hit area — see the tie-break test below for why this selector picks it out from other transparent rects. */
function hoverFirstCategory(svg: SVGElement) {
	const hitAreas = svg.querySelectorAll('rect[fill="transparent"]:not([pointer-events])');
	const target = hitAreas[0] as SVGRectElement;
	const rect = target.getBoundingClientRect();
	target.dispatchEvent(
		new PointerEvent('pointerenter', {
			bubbles: true,
			clientX: rect.left + rect.width / 2,
			clientY: rect.top + rect.height / 2
		})
	);
}

// The hover marker's dot/label/rules only appear once svelteplot's <Pointer>
// reports a match, which requires a real cursor position over the rendered
// marks. These tests exercise the marker's static (no-hover) baseline and
// its configuration surface — not the interactive matching itself.
describe('BarPlot – markers.hover', () => {
	test('renders with a basic hover marker and shows nothing before any hover', async () => {
		const { container } = await render(BarPlot, {
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
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			data: LIFE_EXPECTANCY_BY_PROVINCE,
			x: 'province',
			y: 'value',
			color: 'sex',
			markers: [{ type: 'hover', series: 'female' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with scope "segment" over a segmented series', async () => {
		const segments: SegmentsConfig<BarSegmentStyle> = {
			female: [
				{ areas: [{ x: { from: 'Buenos Aires', to: 'Córdoba' } }], styles: {} },
				{ styles: { fillOpacity: 0.4 } }
			]
		};
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			segments,
			markers: [
				{ type: 'hover', series: 'female', scope: 'segment' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with ruleX/ruleY explicitly disabled', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover', ruleX: false, ruleY: false }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with custom dot/font/rule style overrides', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [
				{
					type: 'hover',
					dotStyle: { dotRadius: 6, dotFill: '#e11d48' },
					fontStyle: { fontSize: 14 },
					ruleStyle: { strokeDasharray: '2 2' }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with a custom label format', async () => {
		const { container } = await render(BarPlot, {
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

	// Regression: two categories tied on the same value, matched with
	// `strategy: 'x'` on a horizontal (ungrouped, single-series) bar chart —
	// both rows fall back to the same default series name, so `matched` ends
	// up with two same-series points. HoverMarker's `{#each}` used to key
	// purely by `point.series ?? \`${x}_${y}\``, which only fell back to x/y
	// when series was nullish; here series is the truthy default 'series' for
	// both points, so the key collided and Svelte threw a duplicate-key error.
	test('does not crash when two categories tie under strategy: "x" (hover.activePoint tie-break)', async () => {
		const data = [
			{ province: 'Buenos Aires', value: 1.38 },
			{ province: 'Mendoza', value: 1.38 },
			{ province: 'CABA', value: 2.1 }
		];
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			data,
			x: 'province',
			y: 'value',
			scales: { y: { type: 'categorical' } },
			tooltip: {
				facetId: '',
				sync: false,
				strategy: 'x',
				format: (row) => `${(row as { province: string }).province}`
			},
			markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		// Per-category hit areas — distinct from the plot's own full-box
		// pointer-catcher rect, which also renders `fill="transparent"` but
		// carries `pointer-events="all"`.
		const hitAreas = svg.querySelectorAll('rect[fill="transparent"]:not([pointer-events])');
		expect(hitAreas.length).toBe(3);
		const target = hitAreas[0] as SVGRectElement;
		const rect = target.getBoundingClientRect();
		target.dispatchEvent(
			new PointerEvent('pointerenter', {
				bubbles: true,
				clientX: rect.left + rect.width / 2,
				clientY: rect.top + rect.height / 2
			})
		);
		// Both tied rows (Buenos Aires and Mendoza) should highlight — proving
		// the render survived without crashing on the duplicate key.
		await vi.waitFor(() => {
			expect(countDotMarks(svg)).toBe(2);
		});
	});
});

describe('BarPlot – markers.hover areaX/areaY', () => {
	afterEach(() => resetConfiguration());

	test('off by default — no highlight area even once a category is hovered', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countDotMarks(svg)).toBe(1);
		});
		expect(countHoverAreas(svg)).toBe(0);
	});

	test('areaX renders one translucent area on a vertical bar chart', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover', areaX: true }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countHoverAreas(svg)).toBe(0);
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countHoverAreas(svg)).toBe(1);
		});
		const area = svg.querySelector('rect.hover-area')!;
		// Vertical highlight: thickness is its width, spanning the full plot height.
		expect(Number(area.getAttribute('width'))).toBeGreaterThan(0);
		expect(Number(area.getAttribute('height'))).toBeGreaterThan(0);
	});

	test('areaY renders one translucent area on a horizontal bar chart', async () => {
		const data = [
			{ province: 'Buenos Aires', value: 1.38 },
			{ province: 'Mendoza', value: 2.1 },
			{ province: 'CABA', value: 1.9 }
		];
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			data,
			x: 'province',
			y: 'value',
			scales: { y: { type: 'categorical' } },
			markers: [{ type: 'hover', areaY: true }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countHoverAreas(svg)).toBe(1);
		});
		const area = svg.querySelector('rect.hover-area')!;
		// Horizontal highlight: thickness is its height, spanning the full plot width.
		expect(Number(area.getAttribute('height'))).toBeGreaterThan(0);
		expect(Number(area.getAttribute('width'))).toBeGreaterThan(0);
	});

	// Only the axis actually holding a band scale renders a highlight — a
	// plain bar chart has exactly one (its category axis), so setting both
	// `areaX` and `areaY` still draws a single area here (the "cross" shape
	// needs a chart with a band scale on *both* axes, e.g. a heatmap — see
	// HeatmapPlot's own markers.hover test).
	test('areaY on a vertical bar chart is a no-op — its value axis has no band scale', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover', areaX: true, areaY: true }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countHoverAreas(svg)).toBe(1);
		});
	});

	test('renders with the neutral gray default fill when no areaStyle is given', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover', areaX: true }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countHoverAreas(svg)).toBe(1);
		});
		const area = svg.querySelector('rect.hover-area')!;
		expect(area.getAttribute('fill')).toBe('#94a3b8');
		expect(area.getAttribute('fill-opacity')).toBe('0.25');
	});

	test('an areaStyle override changes the rendered fill', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [
				{ type: 'hover', areaX: true, areaStyle: { fill: '#e11d48', fillOpacity: 0.5 } }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countHoverAreas(svg)).toBe(1);
		});
		const area = svg.querySelector('rect.hover-area')!;
		expect(area.getAttribute('fill')).toBe('#e11d48');
		expect(area.getAttribute('fill-opacity')).toBe('0.5');
	});

	test('a theme-level hover.area override applies without a per-marker areaStyle', async () => {
		setConfiguration({ hover: { area: { fill: '#16a34a', fillOpacity: 0.4 } } });
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover', areaX: true }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countHoverAreas(svg)).toBe(1);
		});
		const area = svg.querySelector('rect.hover-area')!;
		expect(area.getAttribute('fill')).toBe('#16a34a');
		expect(area.getAttribute('fill-opacity')).toBe('0.4');
	});

	test('does not crash with areaX/areaY on a grouped (multi-series) bar chart', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			data: LIFE_EXPECTANCY_BY_PROVINCE,
			x: 'province',
			y: 'value',
			color: 'sex',
			scales: { grouping: { seriesLayout: 'grouped' } },
			markers: [{ type: 'hover', areaX: true }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countHoverAreas(svg)).toBeGreaterThan(0);
		});
	});
});
