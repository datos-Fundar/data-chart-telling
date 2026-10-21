import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { AMERICAS } from '../../../../../stories/plots/correlation/scatter/data';
import { waitForSvg, countDotMarks, countTextLabels } from '../../_helpers/svg';

const DATA_PROPS = { data: AMERICAS, x: 'gdpPerCapita' as const, y: 'lifeExpectancy' as const };

describe('ScatterPlot - styles.values', () => {
	test('no value labels by default', async () => {
		const { container } = await render(ScatterPlot, { width: 400, height: 300, ...DATA_PROPS });
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(0);
		expect(countDotMarks(svg)).toBe(AMERICAS.length);
	});

	test('values.show: true renders one label per point, showing the raw Y value', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			styles: { values: { show: true } } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(AMERICAS.length);
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		expect(labels).toEqual(expect.arrayContaining(AMERICAS.map((d) => String(d.lifeExpectancy))));
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
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		expect(labels).toEqual(
			expect.arrayContaining(AMERICAS.map((d) => `${d.lifeExpectancy.toFixed(1)} yr`))
		);
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
