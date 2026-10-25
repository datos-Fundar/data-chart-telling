import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import type { CellSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import { PENGUIN_COUNTS } from '$datasets';
import { waitForSvg, countCells } from '../../_helpers/svg';

const DATA_PROPS = {
	data: PENGUIN_COUNTS,
	x: 'island' as const,
	y: 'species' as const,
	color: 'count' as const
};

function styleAttrs(svg: SVGElement): string[] {
	return Array.from(svg.querySelectorAll('g.cell rect')).map((r) => r.getAttribute('style') ?? '');
}

describe('HeatmapPlot - segments (areas, "default" key)', () => {
	test('an area segment and the catch-all each apply their own fillOpacity', async () => {
		const xFrom = 'Biscoe';
		const xTo = 'Dream';
		const yFrom = 'Adelie';
		const yTo = 'Adelie';
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			segments: {
				default: [
					{
						areas: [{ x: { from: xFrom, to: xTo }, y: { from: yFrom, to: yTo } }],
						styles: { fillOpacity: 1 }
					},
					{ styles: { fillOpacity: 0.3 } }
				]
			} satisfies SegmentsConfig<CellSegmentStyle>
		});
		const svg = await waitForSvg(container);
		expect(countCells(svg)).toBe(PENGUIN_COUNTS.length);
		const matchedCount = PENGUIN_COUNTS.filter(
			(d) => d.island >= xFrom && d.island <= xTo && d.species >= yFrom && d.species <= yTo
		).length;
		const styles = styleAttrs(svg);
		expect(styles.filter((s) => s.includes('fill-opacity: 1;')).length).toBe(matchedCount);
		expect(styles.filter((s) => s.includes('fill-opacity: 0.3')).length).toBe(
			PENGUIN_COUNTS.length - matchedCount
		);
	});

	test('warns when the "default" key has more than one catch-all segment', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			segments: {
				default: [{ styles: {} }, { styles: {} }] // two catch-alls → ambiguous
			} satisfies SegmentsConfig<CellSegmentStyle>
		});
		await vi.waitFor(
			() => {
				expect(warn).toHaveBeenCalledWith(expect.stringContaining('no areas'));
			},
			{ timeout: 1000 }
		);
		warn.mockRestore();
	});

	test('warns when segments use a series-specific key instead of "default"', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			segments: { penguins: [{ styles: {} }] } satisfies SegmentsConfig<CellSegmentStyle>
		});
		await vi.waitFor(
			() => {
				expect(warn).toHaveBeenCalledWith(expect.stringContaining('penguins'));
			},
			{ timeout: 1000 }
		);
		warn.mockRestore();
	});
});

describe('HeatmapPlot - segments (catch-all + area merging)', () => {
	test('an area segment inherits fill color from the catch-all', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			...DATA_PROPS,
			segments: {
				default: [
					{ styles: { fill: '#e11d48' } },
					{ areas: [{ x: { from: 'Biscoe', to: 'Dream' } }], styles: { fillOpacity: 0.5 } }
				]
			} satisfies SegmentsConfig<CellSegmentStyle>
		});
		const svg = await waitForSvg(container);
		const styles = styleAttrs(svg);
		expect(styles.length).toBe(PENGUIN_COUNTS.length);
		styles.forEach((s) => expect(s).toContain('fill: rgb(225, 29, 72)'));
	});
});
