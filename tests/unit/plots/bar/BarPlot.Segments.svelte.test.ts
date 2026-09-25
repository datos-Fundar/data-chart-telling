import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import {
	FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
	LIFE_EXPECTANCY_BY_PROVINCE
} from '../../../../stories/plots/bar/data';
import { waitForSvg, countBarRects } from '../_helpers/svg';

function styleAttrs(svg: SVGElement): string[] {
	return Array.from(svg.querySelectorAll('g.bar-y rect')).map((r) => r.getAttribute('style') ?? '');
}

describe('BarPlot – segments (areas)', () => {
	test('an area segment and the catch-all each apply their own fillOpacity', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [
				{ name: 'female', x: 'province', y: 'value', data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE }
			],
			segments: {
				female: [
					{ areas: [{ x: { from: 'Buenos Aires', to: 'Córdoba' } }], styles: { fillOpacity: 0.9 } },
					{ styles: { fillOpacity: 0.3 } }
				]
			} satisfies SegmentsConfig<BarSegmentStyle>
		});
		const svg = await waitForSvg(container);
		expect(countBarRects(svg)).toBe(FEMALE_LIFE_EXPECTANCY_BY_PROVINCE.length);
		const styles = styleAttrs(svg);
		expect(styles.filter((s) => s.includes('fill-opacity: 0.9')).length).toBe(2);
		expect(styles.filter((s) => s.includes('fill-opacity: 0.3')).length).toBe(4);
	});

	test('warns when a series has more than one catch-all segment', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await render(BarPlot, {
			width: 400,
			height: 300,
			series: [
				{ name: 'female', x: 'province', y: 'value', data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE }
			],
			segments: {
				female: [{ styles: {} }, { styles: {} }] // two catch-alls → ambiguous
			} satisfies SegmentsConfig<BarSegmentStyle>
		});
		await vi.waitFor(
			() => {
				expect(warn).toHaveBeenCalledWith(expect.stringContaining('no areas'));
			},
			{ timeout: 1000 }
		);
		warn.mockRestore();
	});

	test('a `default` key applies segments to every series', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			data: LIFE_EXPECTANCY_BY_PROVINCE,
			x: 'province',
			y: 'value',
			color: 'sex',
			segments: {
				default: [{ styles: { fillOpacity: 0.5 } }]
			} satisfies SegmentsConfig<BarSegmentStyle>
		});
		const svg = await waitForSvg(container);
		const styles = styleAttrs(svg);
		expect(styles.length).toBe(LIFE_EXPECTANCY_BY_PROVINCE.length);
		styles.forEach((s) => expect(s).toContain('fill-opacity: 0.5'));
	});
});

describe('BarPlot – segments (catch-all + area merging)', () => {
	test('an area segment inherits fill color from the series catch-all', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [
				{ name: 'female', x: 'province', y: 'value', data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE }
			],
			segments: {
				female: [
					{ styles: { fill: '#e11d48' } },
					{ areas: [{ x: { from: 'Buenos Aires', to: 'Córdoba' } }], styles: { fillOpacity: 0.5 } }
				]
			} satisfies SegmentsConfig<BarSegmentStyle>
		});
		const svg = await waitForSvg(container);
		const styles = styleAttrs(svg);
		expect(styles.length).toBe(FEMALE_LIFE_EXPECTANCY_BY_PROVINCE.length);
		styles.forEach((s) => expect(s).toContain('fill: rgb(225, 29, 72)'));
	});
});
