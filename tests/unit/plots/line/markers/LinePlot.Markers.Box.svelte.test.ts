import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../../../../stories/plots/scatter/data';
import { waitForSvg, countBoxMarks } from '../../_helpers/svg';

describe('LinePlot – markers.box', () => {
	test('default orientation (BoxY) renders one box per category', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [{ type: 'box', x: 'region', y: 'gdpPerCapita' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countBoxMarks(svg)).toBe(1);
		expect(svg.querySelectorAll('g.box-y rect').length).toBe(4);
	});

	test('a quantitative x with a band y renders via BoxX, no NaN geometry', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'region',
			scales: { y: { type: 'band' } },
			markers: [{ type: 'box', x: 'gdpPerCapita', y: 'region' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.box-x rect').length).toBe(4);
		expect(svg.outerHTML).not.toContain('NaN');
	});

	test('median AND min/max ticks both show by default, with nothing set at all (this package overrides svelteplot own tickMinMax:false default)', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [{ type: 'box', x: 'region', y: 'gdpPerCapita' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.box-y g.tick-y').length).toBe(3);
	});

	test('tickMedian + tickMinMax both explicit true show all three ticks', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [
				{ type: 'box', x: 'region', y: 'gdpPerCapita', tickMedian: true, tickMinMax: true }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.box-y g.tick-y').length).toBe(3);
	});

	test('tickMinMax: false hides the min/max ticks, the median tick still shows at its own default', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [
				{ type: 'box', x: 'region', y: 'gdpPerCapita', tickMinMax: false }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.box-y g.tick-y').length).toBe(1);
	});

	test('bar: { insetLeft, insetRight } (pixels) narrows the box rects', async () => {
		const wide = (
			await render(LinePlot, {
				width: 400,
				height: 300,
				data: COUNTRIES,
				x: 'region',
				y: 'gdpPerCapita',
				markers: [
					{ type: 'box', x: 'region', y: 'gdpPerCapita' }
				] satisfies AxisBasedMarkersConfig[]
			})
		).container;
		const narrow = (
			await render(LinePlot, {
				width: 400,
				height: 300,
				data: COUNTRIES,
				x: 'region',
				y: 'gdpPerCapita',
				markers: [
					{
						type: 'box',
						x: 'region',
						y: 'gdpPerCapita',
						bar: { insetLeft: 15, insetRight: 15 }
					}
				] satisfies AxisBasedMarkersConfig[]
			})
		).container;
		const wideWidth = Number(
			(await waitForSvg(wide)).querySelector('g.box-y rect')?.getAttribute('width')
		);
		const narrowWidth = Number(
			(await waitForSvg(narrow)).querySelector('g.box-y rect')?.getAttribute('width')
		);
		expect(narrowWidth).toBeCloseTo(wideWidth - 30, 5);
	});

	test('with no bar set at all, the bar fill defaults to the theme palette, and the median tick contrasts against it', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [{ type: 'box', x: 'region', y: 'gdpPerCapita' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const rect = svg.querySelector('g.box-y rect');
		const rectFill = rect?.getAttribute('style');
		expect(rectFill).toMatch(/fill: rgb\(/);
		const medianLine = svg.querySelector('g.box-y g.tick-y line');
		// The default palette's first color (teal) is light enough that black out-contrasts white.
		expect(medianLine?.getAttribute('style')).toContain('rgb(0, 0, 0)');
	});

	test('the median tick auto-contrasts against bar.fill', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [
				{ type: 'box', x: 'region', y: 'gdpPerCapita', bar: { fill: '#7c3aed' } }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const line = svg.querySelector('g.box-y g.tick-y line');
		expect(line?.getAttribute('style')).toContain('rgb(255, 255, 255)');
	});

	test('auto-contrast picks black against a light bar.fill, not always white', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [
				{ type: 'box', x: 'region', y: 'gdpPerCapita', bar: { fill: '#fef08a' } }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const line = svg.querySelector('g.box-y g.tick-y line');
		expect(line?.getAttribute('style')).toContain('rgb(0, 0, 0)');
	});

	test('tickMinMax: true (no options) defaults to MATCHING bar.fill, not contrasting like the median tick', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [
				{
					type: 'box',
					x: 'region',
					y: 'gdpPerCapita',
					tickMinMax: true,
					bar: { fill: '#7c3aed' }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const groups = svg.querySelectorAll('g.box-y g.tick-y');
		expect(groups.length).toBe(3);
		// First group is the median tick (contrasting, white); the other two
		// (min, max) match bar.fill instead of contrasting against it.
		const medianStyle = groups[0].querySelector('line')?.getAttribute('style');
		expect(medianStyle).toContain('rgb(255, 255, 255)');
		for (const group of [groups[1], groups[2]]) {
			expect(group.querySelector('line')?.getAttribute('style')).toContain('rgb(124, 58, 237)');
		}
	});

	test('an explicit tickMedian.stroke is respected, not overridden by the auto-contrast default', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [
				{
					type: 'box',
					x: 'region',
					y: 'gdpPerCapita',
					tickMedian: { stroke: '#22c55e' },
					bar: { fill: '#7c3aed' }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const line = svg.querySelector('g.box-y g.tick-y line');
		expect(line?.getAttribute('style')).toContain('rgb(34, 197, 94)');
	});

	test('an explicit tickMinMax.stroke is respected, not overridden by the matches-bar.fill default', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [
				{
					type: 'box',
					x: 'region',
					y: 'gdpPerCapita',
					tickMinMax: { stroke: '#f97316' },
					bar: { fill: '#7c3aed' }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const groups = svg.querySelectorAll('g.box-y g.tick-y');
		for (const group of [groups[1], groups[2]]) {
			expect(group.querySelector('line')?.getAttribute('style')).toContain('rgb(249, 115, 22)');
		}
	});

	test('tickMedian and tickMinMax style independently, as separate options objects', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [
				{
					type: 'box',
					x: 'region',
					y: 'gdpPerCapita',
					bar: { fill: '#7c3aed' },
					tickMedian: { stroke: '#ffffff', strokeWidth: 3 },
					tickMinMax: true
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const tickLines = svg.querySelectorAll('g.box-y g.tick-y line');
		// 3 groups (median + min + max) × 4 categories = 12 lines. The median
		// tick's own lines are white and thicker; the min/max ticks stay at
		// their own default (matching bar.fill, purple).
		const styles = [...tickLines].map((line) => line.getAttribute('style') ?? '');
		expect(styles.filter((s) => s.includes('rgb(255, 255, 255)')).length).toBe(4);
		expect(styles.filter((s) => s.includes('rgb(124, 58, 237)')).length).toBe(8);
	});

	test('tickMedian/tickMinMax inset narrows the tick line, independent of the bar', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [
				{
					type: 'box',
					x: 'region',
					y: 'gdpPerCapita',
					bar: { insetLeft: 15, insetRight: 15 },
					tickMedian: { inset: 15 }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const boxWidth = Number(svg.querySelector('g.box-y rect')?.getAttribute('width'));
		const tickLine = svg.querySelector('g.box-y g.tick-y line');
		const tickWidth = Math.abs(
			Number(tickLine?.getAttribute('x2')) - Number(tickLine?.getAttribute('x1'))
		);
		expect(tickWidth).toBeCloseTo(boxWidth, 5);
	});

	test('rule inherits its stroke (matching bar.fill) and strokeOpacity (from bar.fillOpacity), unset', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [
				{
					type: 'box',
					x: 'region',
					y: 'gdpPerCapita',
					bar: { fill: '#7c3aed', fillOpacity: 0.3 }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const ruleLine = svg.querySelector('g.box-y g.rule-x line');
		const style = ruleLine?.getAttribute('style');
		expect(style).toContain('rgb(124, 58, 237)');
		expect(style).toContain('stroke-opacity: 0.3');
	});

	test('dot inherits its fill and fillOpacity from bar, unset', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [
				{
					type: 'box',
					x: 'region',
					y: 'gdpPerCapita',
					bar: { fill: '#7c3aed', fillOpacity: 0.3 }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const dot = svg.querySelector('g.box-y g.dot path');
		const style = dot?.getAttribute('style');
		expect(style).toContain('rgb(124, 58, 237)');
		expect(style).toContain('fill-opacity: 0.3');
	});

	test('an explicit dot.fill override wins over the inherited bar.fill default', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [
				{
					type: 'box',
					x: 'region',
					y: 'gdpPerCapita',
					bar: { fill: '#7c3aed' },
					dot: { fill: '#f97316' }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const dot = svg.querySelector('g.box-y g.dot path');
		expect(dot?.getAttribute('style')).toContain('rgb(249, 115, 22)');
	});

	test('dot: { fill: null } renders hollow outlier markers — the string "none" is a known svelteplot gotcha, not a literal', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [
				{
					type: 'box',
					x: 'region',
					y: 'gdpPerCapita',
					dot: { fill: null, stroke: '#7c3aed', strokeWidth: 2 }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const dots = svg.querySelectorAll('g.box-y g.dot path');
		expect(dots.length).toBeGreaterThan(0);
		for (const dot of dots) {
			expect(dot.getAttribute('style')).toContain('fill: none');
		}
	});

	test('dot: { fillOpacity: 0 } is an equally valid way to hide the fill', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: [
				{
					type: 'box',
					x: 'region',
					y: 'gdpPerCapita',
					dot: { fillOpacity: 0, stroke: '#7c3aed', strokeWidth: 2 }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const dots = svg.querySelectorAll('g.box-y g.dot path');
		expect(dots.length).toBeGreaterThan(0);
		// `fill` itself still inherits a real color from `bar` here (only
		// `fillOpacity` was overridden), so the fill is invisible via opacity
		// rather than rendering as the literal `none` the `fill: null` variant does.
		for (const dot of dots) {
			expect(dot.getAttribute('style')).toContain('fill-opacity: 0');
		}
	});

	test("sort reorders the box marker's own internal element order, not the shared axis position", async () => {
		const unsorted = (
			await render(LinePlot, {
				width: 400,
				height: 300,
				data: COUNTRIES,
				x: 'region',
				y: 'gdpPerCapita',
				markers: [
					{ type: 'box', x: 'region', y: 'gdpPerCapita' }
				] satisfies AxisBasedMarkersConfig[]
			})
		).container;
		const sorted = (
			await render(LinePlot, {
				width: 400,
				height: 300,
				data: COUNTRIES,
				x: 'region',
				y: 'gdpPerCapita',
				markers: [
					{ type: 'box', x: 'region', y: 'gdpPerCapita', sort: 'median' }
				] satisfies AxisBasedMarkersConfig[]
			})
		).container;
		// Only the x position (left-right band placement) matters here — the y
		// position can drift by sub-pixel amounts between separate `render()`
		// calls from margin auto-measurement timing, unrelated to `sort`.
		const xOrderOf = (svg: SVGElement) =>
			[...svg.querySelectorAll('g.box-y rect')].map((r) =>
				Math.round(Number(r.getAttribute('transform')?.match(/translate\(([\d.]+)/)?.[1]))
			);
		const unsortedOrder = xOrderOf(await waitForSvg(unsorted));
		const sortedOrder = xOrderOf(await waitForSvg(sorted));
		// Same 4 band positions (the shared scale doesn't move), different DOM order.
		expect(new Set(sortedOrder)).toEqual(new Set(unsortedOrder));
		expect(sortedOrder).not.toEqual(unsortedOrder);
	});

	test('does not crash with an empty markers array', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'region',
			y: 'gdpPerCapita',
			markers: []
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
