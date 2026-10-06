import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { waitForSvg } from '../../_helpers/svg';

const rows = [
	{ x: 1, y: 2, g: 'A' },
	{ x: 2, y: 3, g: 'A' },
	{ x: 1, y: 5, g: 'B' },
	{ x: 2, y: 4, g: 'B' }
];

/** The `stroke` a mark's path is painted with, from its inline style. */
const strokeOf = (path: Element) => (path as SVGElement).style.stroke;

describe('LinePlot – marker colors', () => {
	test('a line marker’s color channel strokes each grouping’s line in its own color', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'x',
			y: 'y',
			markers: [
				{ type: 'line', data: rows, x: 'x', y: 'y', grouping: 'g', color: 'g' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const strokes = [...svg.querySelectorAll('g.lines path')].map(strokeOf);
		expect(strokes).toHaveLength(2);
		expect(new Set(strokes).size).toBe(2);
	});

	test('a dot’s dotStroke "none" draws no outline, instead of a color-scale color', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'x',
			y: 'y',
			markers: [
				{ type: 'dot', data: rows, x: 'x', y: 'y', styles: { dotStroke: 'none' } }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const dots = [...svg.querySelectorAll('g.dot path')];
		expect(dots.length).toBe(rows.length);
		for (const dot of dots) expect(strokeOf(dot)).toBe('none');
	});
});
