import { render } from 'vitest-browser-svelte';
import { describe, test, expect, afterEach, vi } from 'vitest';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import { POPULATION_BY_AGE } from '$datasets';
import { FEMALE_2022_WITH_GAPS } from '$datasets';
import { waitForSvg, countBarRects, countTextLabels } from '../../../_helpers/svg';

// A series' `x`/`y` are the visual axes, like the top-level props: `x` the magnitude, `y` the category.
const FEMALE = {
	name: 'Female',
	x: 'share' as const,
	y: 'ageGroup' as const,
	data: FEMALE_2022_WITH_GAPS
};
const MALE = {
	name: 'Male',
	x: 'share' as const,
	y: 'ageGroup' as const,
	data: POPULATION_BY_AGE.filter((d) => d.year === 2022 && d.sex === 'Male')
};
const REAL_COUNT = FEMALE_2022_WITH_GAPS.filter((d) => d.share != null).length;

describe('PyramidPlot - gaps (no config)', () => {
	test('a missing value renders no bar, not a fake-zero one', async () => {
		const { container } = await render(PyramidPlot, { width: 500, height: 400, series: [FEMALE] });
		const svg = await waitForSvg(container);
		expect(countBarRects(svg)).toBe(REAL_COUNT);
	});

	test('an unfilled gap does not break the shared magnitude domain', async () => {
		// Before the fix, an `undefined` (NaN) magnitude poisoned `maxMagnitude`
		// for the whole plot - every bar (including the real ones) would render
		// with NaN geometry. Real bars should still render fine here.
		const { container } = await render(PyramidPlot, {
			width: 500,
			height: 400,
			series: [FEMALE, MALE]
		});
		const svg = await waitForSvg(container);
		const widths = Array.from(svg.querySelectorAll('g.bar-x rect')).map((r) =>
			Number(r.getAttribute('width'))
		);
		expect(widths.length).toBeGreaterThan(0);
		widths.forEach((w) => expect(Number.isNaN(w)).toBe(false));
	});
});

describe('PyramidPlot - gaps (middle)', () => {
	test('fills the internal gap with two additional bars', async () => {
		const { container } = await render(PyramidPlot, {
			width: 500,
			height: 400,
			series: [FEMALE],
			styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> }
		});
		const svg = await waitForSvg(container);
		expect(countBarRects(svg)).toBe(REAL_COUNT + 2);
	});
});

describe('PyramidPlot - gaps (start/end, opt-in)', () => {
	test('all three zones together fill every gap row', async () => {
		const { container } = await render(PyramidPlot, {
			width: 500,
			height: 400,
			series: [FEMALE],
			styles: {
				gaps: {
					default: { start: { x: 0 }, middle: {}, end: { x: 0 } }
				} satisfies GapsConfig<BarSegmentStyle>
			}
		});
		const svg = await waitForSvg(container);
		expect(countBarRects(svg)).toBe(FEMALE_2022_WITH_GAPS.length);
	});
});

describe('PyramidPlot - gaps (sign correctness)', () => {
	test('a series on the left keeps its filled bars negative; a series on the right keeps them positive', async () => {
		// 'Female' < 'Male' alphabetically, so 'Female' renders on the left
		// (negative x) and 'Male' on the right (positive x).
		const { container } = await render(PyramidPlot, {
			width: 500,
			height: 400,
			series: [FEMALE, MALE],
			styles: { gaps: { Female: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> }
		});
		const svg = await waitForSvg(container);
		const groups = svg.querySelectorAll('g.bar-x');
		// Female: real (12 rects) + gap-fill (2 rects); Male: real (18 rects, no gaps).
		expect(groups.length).toBe(3);
		const femaleGapRect = groups[1].querySelector('rect')!;
		const femaleX = Number(
			femaleGapRect.getAttribute('transform')?.match(/translate\(([^,]+),/)?.[1]
		);
		const maleX = Number(
			groups[2]
				.querySelector('rect')!
				.getAttribute('transform')
				?.match(/translate\(([^,]+),/)?.[1]
		);
		// The diverging baseline sits at the plot's horizontal midpoint -
		// Female's bar should extend left of it (smaller x), Male's right.
		expect(femaleX).toBeLessThan(maleX);
	});
});

describe('PyramidPlot - gaps (styling)', () => {
	afterEach(() => resetConfiguration());

	test('a zone with no `style` falls back to `cfg.pyramid.gap`, not a hardcoded default', async () => {
		setConfiguration({ pyramid: { gap: { fillOpacity: 0.3 } } });
		const { container } = await render(PyramidPlot, {
			width: 500,
			height: 400,
			series: [FEMALE],
			styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> }
		});
		const svg = await waitForSvg(container);
		const styles = Array.from(svg.querySelectorAll('g.bar-x rect')).map(
			(r) => r.getAttribute('style') ?? ''
		);
		expect(styles.some((s) => s.includes('fill-opacity: 0.3'))).toBe(true);
	});

	test("a zone's own `style` still overrides the global default", async () => {
		setConfiguration({ pyramid: { gap: { fillOpacity: 0.3 } } });
		const { container } = await render(PyramidPlot, {
			width: 500,
			height: 400,
			series: [FEMALE],
			styles: {
				gaps: {
					default: { middle: { style: { fillOpacity: 0.9 } } }
				} satisfies GapsConfig<BarSegmentStyle>
			}
		});
		const svg = await waitForSvg(container);
		const styles = Array.from(svg.querySelectorAll('g.bar-x rect')).map(
			(r) => r.getAttribute('style') ?? ''
		);
		expect(styles.some((s) => s.includes('fill-opacity: 0.9'))).toBe(true);
		expect(styles.some((s) => s.includes('fill-opacity: 0.3'))).toBe(false);
	});
});

describe('PyramidPlot - gaps (series-aware)', () => {
	test('a named entry (keyed by series name) fills only that series', async () => {
		const { container } = await render(PyramidPlot, {
			width: 500,
			height: 400,
			series: [FEMALE, MALE],
			styles: { gaps: { Female: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> }
		});
		const svg = await waitForSvg(container);
		expect(countBarRects(svg)).toBe(REAL_COUNT + MALE.data.length + 2);
	});
});

describe('PyramidPlot - gaps (value labels)', () => {
	test('a gap row never gets a value label, filled or not', async () => {
		const { container } = await render(PyramidPlot, {
			width: 500,
			height: 400,
			series: [FEMALE],
			styles: {
				values: { show: true },
				gaps: { default: { middle: {} } }
			} satisfies GapsAwarePlotStylesConfig<BarSegmentStyle>
		});
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(REAL_COUNT);
	});
});

// ── Legend / hover-isolate dimming ──────────────────────────────────────────
// Unlike LinePlot's gap bridge (a separate marker `buildGapMarkers.ts` never
// wired to the disabled override - see the LinePlot legend/gaps tests for
// that bug), `buildPyramidBarMarkers.ts` already threads the same
// `disabledFillFor` through its gap-fill loop as its real-segment loop.
// These are regression tests confirming that stays true, not a bugfix.

describe('PyramidPlot - gaps (hover-isolate dimming)', () => {
	test('isolating one series dims its gap-fill bars exactly like its real ones', async () => {
		const { container } = await render(PyramidPlot, {
			width: 500,
			height: 400,
			series: [FEMALE, MALE],
			styles: {
				values: {
					show: true,
					hoverIsolate: true,
					format: (v: number, name: string) => `${name}: ${v}`
				},
				gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle>
			}
		});
		const svg = await waitForSvg(container);

		const maleLabelGroup = Array.from(svg.querySelectorAll('g[role="presentation"]')).find((g) =>
			g.textContent?.includes('Male')
		);
		expect(maleLabelGroup).toBeTruthy();
		maleLabelGroup!.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));

		await vi.waitFor(() => {
			const dimmedCount = Array.from(svg.querySelectorAll('g.bar-x rect')).filter((r) =>
				r.getAttribute('style')?.includes('fill-opacity: 0.12')
			).length;
			if (dimmedCount === 0) throw new Error('nothing dimmed yet');
		});

		const rects = Array.from(svg.querySelectorAll('g.bar-x rect'));
		const dimmed = rects.filter((r) => r.getAttribute('style')?.includes('fill-opacity: 0.12'));
		// Every one of Female's bars - its `REAL_COUNT` real ones plus the 2
		// gap-fill bars the middle zone adds - dims, not just the real ones.
		expect(dimmed).toHaveLength(REAL_COUNT + 2);
	});
});
