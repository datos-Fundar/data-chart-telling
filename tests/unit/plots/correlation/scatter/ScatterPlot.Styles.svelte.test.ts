import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { waitForSvg, countDotMarks, countTextLabels } from '../../_helpers/svg';

import { COUNTRIES_AT_2007 } from '$datasets';

const DATA_PROPS = { data: COUNTRIES_AT_2007, x: 'gdp' as const, y: 'life' as const };

describe('ScatterPlot - styles.values', () => {
	test('no value labels by default', async () => {
		const { container } = await render(ScatterPlot, { width: 400, height: 300, ...DATA_PROPS });
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(0);
		expect(countDotMarks(svg)).toBe(COUNTRIES_AT_2007.length);
	});

	test('values.show: true labels the points with their raw Y value, none overlapping another', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			styles: { values: { show: true } } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => countTextLabels(svg)).toBeGreaterThan(0);
		const nodes = Array.from(svg.querySelectorAll('g.text text'));
		const values = new Set(COUNTRIES_AT_2007.map((d) => String(d.life)));
		expect(nodes.every((t) => values.has(t.textContent ?? ''))).toBe(true);
		const boxes = nodes.map((t) => t.getBoundingClientRect());
		const overlap = (a: DOMRect, b: DOMRect) =>
			a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
		expect(boxes.some((a, i) => boxes.some((b, j) => i < j && overlap(a, b)))).toBe(false);
	});

	test('a label with no free spot around its point is left out', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			styles: { values: { show: true } } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => countTextLabels(svg)).toBeGreaterThan(0);
		expect(countTextLabels(svg)).toBeLessThan(COUNTRIES_AT_2007.length);
	});

	test('a custom format callback overrides the default label text', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			styles: {
				values: { show: true, format: (v: number) => `${v.toFixed(1)} yr` }
			} satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => countTextLabels(svg)).toBeGreaterThan(0);
		const formatted = new Set(COUNTRIES_AT_2007.map((d) => `${d.life.toFixed(1)} yr`));
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent ?? '');
		expect(labels.every((label) => formatted.has(label))).toBe(true);
	});

	test('a label that would cross the right edge flips to the left of its point', async () => {
		const rows = [
			{ x: 0, y: 0 },
			{ x: 10, y: 10 }
		];
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'x',
			y: 'y',
			margins: { right: 10 },
			styles: {
				values: { show: true, format: (v: number) => `value ${v}` }
			} satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		const anchorOf = (text: string) =>
			Array.from(svg.querySelectorAll('g.text text'))
				.find((t) => t.textContent === text)
				?.getAttribute('style');
		// The left point keeps its preferred side; the right one, pinned at the edge, flips.
		expect(anchorOf('value 0')).toContain('text-anchor: start');
		expect(anchorOf('value 10')).toContain('text-anchor: end');
	});
});
