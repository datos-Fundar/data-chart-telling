import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { waitForSvg, countBarRects } from '../../plots/_helpers/svg';

describe('x1/x2/y1/y2 channel - bar marker with field-key shorthand', () => {
	test('a hand-authored bar marker using y1/y2 as field keys renders one extra rect per row', async () => {
		const data = [
			{ province: 'Buenos Aires', lo: 79.8, hi: 84.2 },
			{ province: 'Córdoba', lo: 79.1, hi: 83.5 }
		];
		const { container } = render(BarPlot, {
			width: 400,
			height: 300,
			data,
			x: 'province',
			y: 'hi',
			markers: [
				{
					type: 'bar',
					role: 'segment',
					isHorizontal: false,
					data,
					x: (d) => (d as (typeof data)[number]).province,
					y1: 'lo',
					y2: 'hi',
					styles: { fill: '#0891b2' }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		// The base plot's own bars (one per row) plus the marker's own bars (one per row).
		expect(countBarRects(svg)).toBe(data.length * 2);
	});
});

describe('x1/x2/y1/y2 channel - rect marker', () => {
	test('a rect marker with literal x1/x2/y1/y2 renders a rectangle', async () => {
		const data = [
			{ year: 2008, value: 75 },
			{ year: 2020, value: 80 }
		];
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data,
			x: 'year',
			y: 'value',
			markers: [
				{
					type: 'rect',
					data: [{}],
					x1: 2010,
					x2: 2014,
					y1: 70,
					y2: 90,
					styles: { fill: '#fde68a' }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		// svelteplot's `Rect` mark renders a bare `<rect>`, not scoped to its own
		// class - filter out the plot's own transparent pointer-capture rect, and
		// the frame's clip-path rect, which is a `<clipPath>` child, not a mark.
		const rects = Array.from(svg.querySelectorAll('rect')).filter(
			(r) => r.getAttribute('fill') !== 'transparent' && !r.closest('clipPath')
		);
		expect(rects).toHaveLength(1);
		expect(rects[0].getAttribute('style')).toContain('rgb(253, 230, 138)');
	});
});
