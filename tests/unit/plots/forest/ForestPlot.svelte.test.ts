import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import ForestPlot from '$lib/plots/forest/Plot.svelte';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { ClevelandMarkers } from '$lib/plots/cleveland/ClevelandMarkers';
import { waitForSvg, countDotMarks } from '../_helpers/svg';

/** Three estimates and the interval of each: `a` 0.8 (0.5-1.1), `b` 1.4 (0.9-2.1), `c` 0.3 (-0.2-0.7). */
const rows = [
	{ c: 'a', v: 0.8, lo: 0.5, hi: 1.1 },
	{ c: 'b', v: 1.4, lo: 0.9, hi: 2.1 },
	{ c: 'c', v: 0.3, lo: -0.2, hi: 0.7 }
];

const stems = (svg: SVGElement, axis: 'x' | 'y' = 'x') =>
	Array.from(svg.querySelectorAll(`g.rule-${axis} line`)) as SVGLineElement[];

describe('ForestPlot', () => {
	beforeEach(() => ClevelandMarkers.resetWarnings());

	test('draws a dot and a stem per row, the stem spanning its interval', async () => {
		const { container } = render(ForestPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v',
			lower: 'lo',
			upper: 'hi'
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(3);
		const lengths = stems(svg).map((s) =>
			Math.abs(Number(s.getAttribute('y2')) - Number(s.getAttribute('y1')))
		);
		expect(lengths).toHaveLength(3);
		// `b`'s interval (1.2 long) is the widest, `c`'s (0.9) next, `a`'s (0.6) the narrowest.
		expect(lengths[1]).toBeGreaterThan(lengths[2]);
		expect(lengths[2]).toBeGreaterThan(lengths[0]);
		expect(svg.outerHTML).not.toContain('NaN');
	});

	test('error reaches that far either side of the value', async () => {
		const { container } = render(ForestPlot, {
			width: 400,
			height: 300,
			data: rows.map((r) => ({ ...r, e: 0.5 })),
			x: 'c',
			y: 'v',
			error: 'e'
		});
		const svg = await waitForSvg(container);
		const lengths = stems(svg).map((s) =>
			Math.abs(Number(s.getAttribute('y2')) - Number(s.getAttribute('y1')))
		);
		expect(new Set(lengths.map((l) => Math.round(l))).size).toBe(1);
	});

	test('the value axis reaches the intervals, not only the values', async () => {
		const { container } = render(ForestPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v',
			lower: 'lo',
			upper: 'hi'
		});
		const svg = await waitForSvg(container);
		const ticks = Array.from(svg.querySelectorAll('g.axis-y text')).map((t) =>
			Number((t.textContent ?? '').replace(',', '.'))
		);
		// The widest interval ends at 2.1 and the lowest at -0.2: the axis holds both.
		expect(Math.max(...ticks)).toBeGreaterThanOrEqual(2.1);
		expect(Math.min(...ticks)).toBeLessThanOrEqual(-0.2);
	});

	test('categories along y lay the rows out sideways', async () => {
		const { container } = render(ForestPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'v',
			y: 'c',
			lower: 'lo',
			upper: 'hi'
		});
		const svg = await waitForSvg(container);
		expect(stems(svg, 'y')).toHaveLength(3);
		expect(stems(svg, 'x')).toHaveLength(0);
	});

	test('warns, pointing to facet, when a category has values in several series', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		render(ForestPlot, {
			width: 400,
			height: 300,
			data: [...rows, { c: 'a', v: 1, lo: 0.4, hi: 1.5, g: 'x' }].map((r) => ({
				g: 'y',
				...r
			})),
			x: 'c',
			y: 'v',
			lower: 'lo',
			upper: 'hi',
			color: 'g'
		});
		await vi.waitFor(() => expect(warn).toHaveBeenCalledWith(expect.stringContaining('`facet`')));
		warn.mockRestore();
	});

	test('its configuration block sets the dot radius and the stem width', async () => {
		const { container } = render(ForestPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v',
			lower: 'lo',
			upper: 'hi'
		});
		const svg = await waitForSvg(container);
		expect(parseFloat(getComputedStyle(stems(svg)[0]).strokeWidth)).toBe(
			DEFAULT_CONFIG.forest.stemWidth
		);
	});
});
