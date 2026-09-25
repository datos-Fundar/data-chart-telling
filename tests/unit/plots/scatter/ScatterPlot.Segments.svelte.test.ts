import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import { AMERICAS, COUNTRIES } from '../../../../stories/plots/scatter/data';
import { waitForSvg, countDotMarks } from '../_helpers/svg';

describe('ScatterPlot – segments', () => {
	test('an area segment overrides fill only for the matched points', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: AMERICAS,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			segments: {
				default: [{ areas: [{ x: { from: 40 } }], styles: { dotFill: '#dc2626' } }]
			} satisfies SegmentsConfig<ScatterSegmentStyle>
		});
		const svg = await waitForSvg(container);
		// Two style groups (matched vs unmatched) render as two 'dot' markers.
		expect(countDotMarks(svg)).toBe(AMERICAS.length);
		const paths = [...svg.querySelectorAll('g.dot path')];
		const redOnes = paths.filter((p) =>
			p.getAttribute('style')?.includes('fill: rgb(220, 38, 38)')
		);
		expect(redOnes.length).toBeGreaterThan(0);
		expect(redOnes.length).toBeLessThan(AMERICAS.length);
	});

	test('does not render an extra dot count when segments split a series into groups', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			color: 'region',
			segments: {
				default: [
					{ areas: [{ y: { to: 65 } }], styles: { dotFill: '#dc2626' } },
					{ areas: [{ y: { from: 82 } }], styles: { dotFill: '#16a34a' } }
				]
			} satisfies SegmentsConfig<ScatterSegmentStyle>
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(COUNTRIES.length);
	});

	test('an area segment inherits dotFill from the series catch-all', async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: AMERICAS,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			segments: {
				default: [
					{ styles: { dotFill: '#0891b2' } },
					{ areas: [{ x: { from: 40 } }], styles: { dotRadius: 10 } }
				]
			} satisfies SegmentsConfig<ScatterSegmentStyle>
		});
		const svg = await waitForSvg(container);
		const paths = [...svg.querySelectorAll('g.dot path')];
		expect(paths.length).toBeGreaterThan(0);
		paths.forEach((p) => expect(p.getAttribute('style')).toContain('fill: rgb(8, 145, 178)'));
	});

	test('warns when a series has more than one catch-all segment', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: AMERICAS,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			segments: {
				default: [{ styles: {} }, { styles: {} }]
			} satisfies SegmentsConfig<ScatterSegmentStyle>
		});
		await vi.waitFor(
			() => {
				expect(warn).toHaveBeenCalledWith(expect.stringContaining('no areas'));
			},
			{ timeout: 1000 }
		);
		warn.mockRestore();
	});
});
