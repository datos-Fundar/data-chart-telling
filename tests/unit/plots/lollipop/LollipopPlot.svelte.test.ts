import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ClevelandMarkers } from '$lib/plots/cleveland/ClevelandMarkers';
import LollipopPlot from '$lib/plots/lollipop/Plot.svelte';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { waitForSvg, countDotMarks } from '../_helpers/svg';

const rows = [
	{ c: 'a', v: 4, g: 'A' },
	{ c: 'b', v: 9, g: 'A' },
	{ c: 'c', v: -3, g: 'B' }
];

/** Each stem: svelteplot's `RuleX`/`RuleY` draws one `<line>` per row inside `g.rule-x`/`g.rule-y`. */
const stems = (svg: SVGElement, axis: 'x' | 'y' = 'x') =>
	Array.from(svg.querySelectorAll(`g.rule-${axis} line`)) as SVGLineElement[];

describe('LollipopPlot', () => {
	beforeEach(() => ClevelandMarkers.resetWarnings());

	test('warns, pointing to the plots for several series, when a category has values in two', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		render(LollipopPlot, {
			width: 400,
			height: 300,
			data: [...rows, { c: 'a', v: 7, g: 'B' }],
			x: 'c',
			y: 'v',
			color: 'g'
		});
		await vi.waitFor(() =>
			expect(warn).toHaveBeenCalledWith(expect.stringContaining('Use DumbbellPlot for two series'))
		);
		warn.mockRestore();
	});

	test('does not warn when each category has one value, even across series', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { container } = render(LollipopPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v',
			color: 'c'
		});
		await waitForSvg(container);
		expect(warn).not.toHaveBeenCalled();
		warn.mockRestore();
	});

	test('a flat data plot draws one stem and one dot per category', async () => {
		const { container } = render(LollipopPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v'
		});
		const svg = await waitForSvg(container);
		expect(stems(svg)).toHaveLength(3);
		expect(countDotMarks(svg)).toBe(3);
		expect(svg.outerHTML).not.toContain('NaN');
	});

	test('color splits the rows into one series per group, each in its own color', async () => {
		const { container } = render(LollipopPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v',
			color: 'g'
		});
		const svg = await waitForSvg(container);
		const colors = new Set(stems(svg).map((s) => getComputedStyle(s).stroke));
		expect(colors.size).toBe(2);
	});

	test('a series-based plot draws one stem per category', async () => {
		const { container } = render(LollipopPlot, {
			width: 400,
			height: 300,
			series: [
				{ name: 'A', data: rows.filter((r) => r.g === 'A'), x: 'c', y: 'v' },
				{ name: 'B', data: rows.filter((r) => r.g === 'B'), x: 'c', y: 'v' }
			]
		});
		const svg = await waitForSvg(container);
		expect(stems(svg)).toHaveLength(3);
	});

	test('categories along y lay the lollipops out sideways', async () => {
		const { container } = render(LollipopPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'v',
			y: 'c'
		});
		const svg = await waitForSvg(container);
		expect(stems(svg, 'y')).toHaveLength(3);
		expect(stems(svg, 'x')).toHaveLength(0);
		expect(svg.outerHTML).not.toContain('NaN');
	});

	test('stems start at zero, so a negative value hangs below it', async () => {
		const { container } = render(LollipopPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v'
		});
		const svg = await waitForSvg(container);
		const [a, , c] = stems(svg);
		const ends = (line: SVGLineElement) => [
			Number(line.getAttribute('y1')),
			Number(line.getAttribute('y2'))
		];
		// Every stem shares the baseline end; `a` rises above it and `c` hangs below it.
		const [aFrom, aTo] = ends(a);
		const [cFrom, cTo] = ends(c);
		expect(aFrom).toBeCloseTo(cTo);
		expect(aTo).toBeLessThan(aFrom);
		expect(cFrom).toBeGreaterThan(cTo);
	});

	test('the configured dot radius and stem width apply unless a segment sets its own', async () => {
		const props = { width: 400, height: 300, data: rows, x: 'c', y: 'v' };
		const { container } = render(LollipopPlot, props);
		const svg = await waitForSvg(container);
		expect(parseFloat(getComputedStyle(stems(svg)[0]).strokeWidth)).toBe(
			DEFAULT_CONFIG.lollipop.stemWidth
		);

		const styled = render(LollipopPlot, {
			...props,
			segments: { default: [{ styles: { stroke: { strokeWidth: 5 } } }] }
		});
		const own = await waitForSvg(styled.container);
		expect(parseFloat(getComputedStyle(stems(own)[0]).strokeWidth)).toBe(5);
	});

	test('styles.values writes each value beside its dot', async () => {
		const { container } = render(LollipopPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v',
			styles: { values: { show: true } }
		});
		const svg = await waitForSvg(container);
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		expect(labels).toEqual(['4', '9', '-3']);
	});

	test('stems of two looks - one dashed by a segment - draw together, each category once', async () => {
		const { container } = render(LollipopPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v',
			segments: {
				default: [
					{
						areas: [{ x: { from: 'b', to: 'b' } }],
						styles: { stroke: { strokeDasharray: '4 3' } }
					}
				]
			}
		});
		const svg = await waitForSvg(container);
		// One rule marker per dash pattern, side by side: none replaces another.
		expect(svg.querySelectorAll('g.rule-x')).toHaveLength(2);
		expect(stems(svg)).toHaveLength(3);
	});
});
