import { render } from 'vitest-browser-svelte';
import { describe, test, expect, afterEach, vi } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import { FEMALE_PROVINCE_VALUES, PROVINCE_VALUES } from '$datasets';
import { waitForSvg, countDotMarks, countTextLabels, countHoverAreas } from '../../../_helpers/svg';

const FEMALE = {
	name: 'female',
	x: 'province' as const,
	y: 'value' as const,
	data: FEMALE_PROVINCE_VALUES
};

/** Dispatches a centered `pointerenter` on the first per-category hit area - see the tie-break test below for why this selector picks it out from other transparent rects. */
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

// The static baseline and configuration of the hover marker; matching needs a real cursor.
describe('BarPlot - markers.hover', () => {
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
			data: PROVINCE_VALUES,
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

	test('does not crash with nothing drawn behind', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover', back: [] }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with a rule behind and a dot and a label in front', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [
				{
					type: 'hover',
					back: [
						{ type: 'rule', axis: 'x', value: (p) => p.x, styles: { strokeDasharray: '2 2' } }
					],
					front: [
						{ type: 'dot', styles: { dotRadius: 6, dotFill: '#e11d48' } },
						{ type: 'text', text: (p) => p.label, styles: { fontSize: 14 } }
					]
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

	// Two categories tied under `strategy: 'x'` share a series name and must not collide as keys.
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
			x: 'value',
			y: 'province',
			tooltip: {
				sync: false,
				strategy: 'x',
				format: (row) => `${(row as { province: string }).province}`
			},
			markers: [{ type: 'hover', front: [{ type: 'dot' }] }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		// Per-category hit areas, not the plot's full-box pointer catcher.
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
		// Both tied rows (Buenos Aires and Mendoza) should highlight - proving
		// the render survived without crashing on the duplicate key.
		await vi.waitFor(() => {
			expect(countDotMarks(svg)).toBe(2);
		});
	});
});

describe('BarPlot - the band its hover draws behind the bars', () => {
	afterEach(() => resetConfiguration());

	test('draws no dot or label, and no band once the author asks for nothing behind', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover', back: [] }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		hoverFirstCategory(svg);
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(countHoverAreas(svg)).toBe(0);
		expect(countDotMarks(svg)).toBe(0);
	});

	test('renders one translucent band on a vertical bar chart', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countHoverAreas(svg)).toBe(0);
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countHoverAreas(svg)).toBe(1);
		});
		const area = svg.querySelector('g.band rect')!;
		// Vertical highlight: thickness is its width, spanning the full plot height.
		expect(Number(area.getAttribute('width'))).toBeGreaterThan(0);
		expect(Number(area.getAttribute('height'))).toBeGreaterThan(0);
	});

	test('renders one translucent band on a horizontal bar chart', async () => {
		const data = [
			{ province: 'Buenos Aires', value: 1.38 },
			{ province: 'Mendoza', value: 2.1 },
			{ province: 'CABA', value: 1.9 }
		];
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			data,
			x: 'value',
			y: 'province',
			markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countHoverAreas(svg)).toBe(1);
		});
		const area = svg.querySelector('g.band rect')!;
		// Horizontal highlight: thickness is its height, spanning the full plot width.
		expect(Number(area.getAttribute('height'))).toBeGreaterThan(0);
		expect(Number(area.getAttribute('width'))).toBeGreaterThan(0);
	});

	// Only the band axis gets a band, so one along each axis draws one here.
	test('a band along y on a vertical bar chart draws nothing - its value axis has no band scale', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
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
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countHoverAreas(svg)).toBe(1);
		});
	});

	test('renders with the neutral gray default fill of the configuration', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countHoverAreas(svg)).toBe(1);
		});
		const area = svg.querySelector('g.band rect')!;
		expect(area.getAttribute('fill')).toBe('#94a3b8');
		expect(area.getAttribute('fill-opacity')).toBe('0.4');
	});

	test("a band of the author's own replaces the plot's", async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [
				{
					type: 'hover',
					back: [
						{
							type: 'band',
							axis: 'x',
							value: (p) => p.x,
							styles: { fill: '#e11d48', fillOpacity: 0.5 }
						}
					]
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countHoverAreas(svg)).toBe(1);
		});
		const area = svg.querySelector('g.band rect')!;
		expect(area.getAttribute('fill')).toBe('#e11d48');
		expect(area.getAttribute('fill-opacity')).toBe('0.5');
	});

	test("the configuration's hover.area styles the plot's band", async () => {
		setConfiguration({ hover: { area: { fill: '#16a34a', fillOpacity: 0.4 } } });
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countHoverAreas(svg)).toBe(1);
		});
		const area = svg.querySelector('g.band rect')!;
		expect(area.getAttribute('fill')).toBe('#16a34a');
		expect(area.getAttribute('fill-opacity')).toBe('0.4');
	});

	test('does not crash on a grouped (multi-series) bar chart', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			data: PROVINCE_VALUES,
			x: 'province',
			y: 'value',
			color: 'sex',
			markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		hoverFirstCategory(svg);
		await vi.waitFor(() => {
			expect(countHoverAreas(svg)).toBeGreaterThan(0);
		});
	});

	test('covers the whole group of a grouped bar chart when the hover matches every series of it, and a series slice when it matches that one', async () => {
		const grouped = (strategy: 'x' | 'series') =>
			render(BarPlot, {
				width: 400,
				height: 300,
				data: PROVINCE_VALUES,
				x: 'province',
				y: 'value',
				color: 'sex',
				tooltip: { strategy },
				markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
			});
		const widthOfArea = async (strategy: 'x' | 'series', bands: number) => {
			const { container } = await grouped(strategy);
			const svg = await waitForSvg(container);
			hoverFirstCategory(svg);
			await vi.waitFor(() => expect(countHoverAreas(svg)).toBe(bands));
			return Number(svg.querySelector('g.band rect')!.getAttribute('width'));
		};
		const categories = new Set(PROVINCE_VALUES.map((row) => row.province)).size;
		// `'x'` matches both series of the category: one band, the whole of it. `'series'` matches the hovered
		// series in every category: a band in each, narrowed to the series' slice.
		const whole = await widthOfArea('x', 1);
		const own = await widthOfArea('series', categories);
		expect(whole).toBeGreaterThan(own * 1.5);
	});
});
