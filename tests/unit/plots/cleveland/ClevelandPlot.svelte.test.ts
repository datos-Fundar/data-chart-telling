import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ClevelandPlot from '$lib/plots/cleveland/Plot.svelte';
import { waitForSvg, countDotMarks } from '../_helpers/svg';

/** Two categories, three series each: `a` spans 1-9, `b` spans 4-6. */
const rows = [
	{ c: 'a', v: 1, g: 'lo' },
	{ c: 'a', v: 5, g: 'mid' },
	{ c: 'a', v: 9, g: 'hi' },
	{ c: 'b', v: 4, g: 'lo' },
	{ c: 'b', v: 5, g: 'mid' },
	{ c: 'b', v: 6, g: 'hi' }
];

/** Each connector: svelteplot's `RuleX`/`RuleY` draws one `<line>` per category inside `g.rule-x`/`g.rule-y`. */
const connectors = (svg: SVGElement, axis: 'x' | 'y' = 'x') =>
	Array.from(svg.querySelectorAll(`g.rule-${axis} line`)) as SVGLineElement[];

describe('ClevelandPlot', () => {
	test('draws one connector per category and one dot per row', async () => {
		const { container } = render(ClevelandPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v',
			color: 'g'
		});
		const svg = await waitForSvg(container);
		expect(connectors(svg)).toHaveLength(2);
		expect(countDotMarks(svg)).toBe(6);
		expect(svg.outerHTML).not.toContain('NaN');
	});

	test('one dot marker per series, each in its own color', async () => {
		const { container } = render(ClevelandPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v',
			color: 'g'
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.dot')).toHaveLength(3);
		const fills = new Set(
			Array.from(svg.querySelectorAll('g.dot path')).map((d) => getComputedStyle(d).fill)
		);
		expect(fills.size).toBe(3);
	});

	test('a connector spans its category from the lowest to the highest value', async () => {
		const { container } = render(ClevelandPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v',
			color: 'g'
		});
		const svg = await waitForSvg(container);
		const [a, b] = connectors(svg);
		const length = (line: SVGLineElement) =>
			Math.abs(Number(line.getAttribute('y2')) - Number(line.getAttribute('y1')));
		// Category `a` spans 8 and `b` spans 2, on one value axis.
		expect(length(a) / length(b)).toBeCloseTo(4);
	});

	test('categories along y lay the rows out sideways', async () => {
		const { container } = render(ClevelandPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'v',
			y: 'c',
			color: 'g'
		});
		const svg = await waitForSvg(container);
		expect(connectors(svg, 'y')).toHaveLength(2);
		expect(connectors(svg, 'x')).toHaveLength(0);
		expect(svg.outerHTML).not.toContain('NaN');
	});

	test('the value axis fits the values without reaching for zero', async () => {
		const { container } = render(ClevelandPlot, {
			width: 400,
			height: 300,
			data: rows.map((r) => ({ ...r, v: r.v + 100 })),
			x: 'c',
			y: 'v',
			color: 'g'
		});
		const svg = await waitForSvg(container);
		const ticks = Array.from(svg.querySelectorAll('g.axis-y text')).map((t) =>
			Number(t.textContent)
		);
		expect(Math.min(...ticks)).toBeGreaterThan(0);
	});

	test('styles.values writes every dot value, past the ends and beside the ones between', async () => {
		const { container } = render(ClevelandPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v',
			color: 'g',
			styles: { values: { show: true } }
		});
		const svg = await waitForSvg(container);
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		expect(labels.sort()).toEqual(['1', '4', '5', '5', '6', '9']);
	});
});
