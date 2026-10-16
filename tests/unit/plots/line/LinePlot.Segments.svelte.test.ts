import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import { FEMALE_LIFE_EXPECTANCY, LIFE_EXPECTANCY } from '../../../../stories/plots/line/data';
import { waitForSvg, countLinePaths, countDotMarks } from '../_helpers/svg';

// ── Areas: matching and continuity ────────────────────────────────────────────

describe('LinePlot - segments (areas)', () => {
	test('renders one path per visual segment', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY }],
			segments: {
				female: [
					{ areas: [{ x: { to: 2014 } }], styles: { stroke: { stroke: '#4f46e5' } } },
					{
						areas: [{ x: { from: 2014 } }],
						styles: { stroke: { stroke: '#4f46e5', strokeDasharray: '6 4' } }
					}
				]
			} satisfies SegmentsConfig<LineSegmentStyle>
		});
		const svg = await waitForSvg(container);
		// Two area segments plus the connector bridging the gap between them.
		expect(countLinePaths(svg)).toBe(3);
	});

	test('renders one path per series when no segments are provided', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [
				{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY },
				{ name: 'female-copy', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY }
			]
		});
		const svg = await waitForSvg(container);
		expect(countLinePaths(svg)).toBe(2);
	});

	test('warns when a series has more than one catch-all segment', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await render(LinePlot, {
			width: 400,
			height: 300,
			series: [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY }],
			segments: {
				female: [{ styles: {} }, { styles: {} }] // two catch-alls → ambiguous
			} satisfies SegmentsConfig<LineSegmentStyle>
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

// ── Dots ──────────────────────────────────────────────────────────────────────

describe('LinePlot - segments (dots)', () => {
	test('does not render dots when the style has no `dots` key', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY }],
			segments: {
				female: [{ styles: { stroke: { stroke: '#4f46e5' } } }]
			} satisfies SegmentsConfig<LineSegmentStyle>
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(0);
	});

	test('renders one dot per data point when `dots` is present', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY }],
			segments: {
				female: [{ styles: { dots: { dotRadius: 4 } } }]
			} satisfies SegmentsConfig<LineSegmentStyle>
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(FEMALE_LIFE_EXPECTANCY.length);
	});

	test('keeps all dots when the series is split into styled segments', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY }],
			segments: {
				female: [
					{ areas: [{ x: { to: 2014 } }], styles: { dots: { dotRadius: 4 } } },
					{
						areas: [{ x: { from: 2014 } }],
						styles: { stroke: { strokeDasharray: '5 5' }, dots: { dotRadius: 4 } }
					}
				]
			} satisfies SegmentsConfig<LineSegmentStyle>
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(FEMALE_LIFE_EXPECTANCY.length);
	});

	test('dots inherit the stroke color when dotFill is not specified', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY }],
			segments: {
				female: [{ styles: { stroke: { stroke: '#dc2626' }, dots: { dotRadius: 4 } } }]
			} satisfies SegmentsConfig<LineSegmentStyle>
		});
		const svg = await waitForSvg(container);
		const dot = svg.querySelector('g.dot path');
		expect(dot?.getAttribute('style')).toContain('fill: rgb(220, 38, 38)');
	});

	test('dotRadius changes the rendered dot geometry', async () => {
		async function dotPathD(dotRadius: number) {
			const { container } = await render(LinePlot, {
				width: 400,
				height: 300,
				series: [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY }],
				segments: {
					female: [{ styles: { dots: { dotRadius } } }]
				} satisfies SegmentsConfig<LineSegmentStyle>
			});
			const svg = await waitForSvg(container);
			return svg.querySelector('g.dot path')?.getAttribute('d');
		}
		const small = await dotPathD(2);
		const large = await dotPathD(12);
		expect(small).toBeTruthy();
		expect(large).toBeTruthy();
		expect(small).not.toBe(large);
	});
});

// ── Catch-all merging ─────────────────────────────────────────────────────────

describe('LinePlot - segments (catch-all + area merging)', () => {
	test('an area segment inherits stroke from the series catch-all', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY }],
			segments: {
				female: [
					{ styles: { stroke: { stroke: '#e11d48' } } },
					{ areas: [{ x: { from: 2016 } }], styles: { dots: { dotRadius: 5 } } }
				]
			} satisfies SegmentsConfig<LineSegmentStyle>
		});
		const svg = await waitForSvg(container);
		// Every line path (catch-all run + area run + connector) keeps the inherited color.
		const paths = svg.querySelectorAll('g.lines path');
		expect(paths.length).toBeGreaterThan(0);
		paths.forEach((p) => expect(p.getAttribute('style')).toContain('stroke: rgb(225, 29, 72)'));
	});

	test('a `default` key applies segments to every series', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			data: LIFE_EXPECTANCY,
			x: 'year',
			y: 'value',
			color: 'sex',
			segments: {
				default: [{ styles: { dots: { dotRadius: 4 } } }]
			} satisfies SegmentsConfig<LineSegmentStyle>
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(LIFE_EXPECTANCY.length);
	});
});
