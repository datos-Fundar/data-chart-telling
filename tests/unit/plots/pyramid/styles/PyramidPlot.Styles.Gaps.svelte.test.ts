import { render } from 'vitest-browser-svelte';
import { describe, test, expect, afterEach, vi } from 'vitest';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import { POPULATION_PYRAMID, MUJERES_2022_WITH_GAPS } from '../../../../../stories/data/population-pyramid';
import { waitForSvg, countBarRects, countTextLabels } from '../../_helpers/svg';

// PyramidPlot's `Series.x`/`.y` are category/magnitude (not the top-level
// `x`/`y` prop names, which mean magnitude/category) — see Plot.svelte's
// own `flat`/`signedValue`, which read `s.x` as category and `s.y` as value.
const MUJERES = { name: 'Mujeres', x: 'ageGroup' as const, y: 'pct' as const, data: MUJERES_2022_WITH_GAPS };
const VARONES = {
  name: 'Varones',
  x: 'ageGroup' as const,
  y: 'pct' as const,
  data: POPULATION_PYRAMID.filter((d) => d.year === 2022 && d.sex === 'Varones'),
};
const REAL_COUNT = MUJERES_2022_WITH_GAPS.filter((d) => d.pct != null).length;

describe('PyramidPlot – gaps (no config)', () => {
  test('a missing value renders no bar, not a fake-zero one', async () => {
    const { container } = await render(PyramidPlot, { width: 500, height: 400, series: [MUJERES] });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(REAL_COUNT);
  });

  test('an unfilled gap does not break the shared magnitude domain', async () => {
    // Before the fix, an `undefined` (NaN) magnitude poisoned `maxMagnitude`
    // for the whole plot — every bar (including the real ones) would render
    // with NaN geometry. Real bars should still render fine here.
    const { container } = await render(PyramidPlot, { width: 500, height: 400, series: [MUJERES, VARONES] });
    const svg = await waitForSvg(container);
    const widths = Array.from(svg.querySelectorAll('g.bar-x rect')).map((r) => Number(r.getAttribute('width')));
    expect(widths.length).toBeGreaterThan(0);
    widths.forEach((w) => expect(Number.isNaN(w)).toBe(false));
  });
});

describe('PyramidPlot – gaps (middle)', () => {
  test('fills the internal gap with two additional bars', async () => {
    const { container } = await render(PyramidPlot, {
      width: 500,
      height: 400,
      series: [MUJERES],
      styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(REAL_COUNT + 2);
  });
});

describe('PyramidPlot – gaps (start/end, opt-in)', () => {
  test('all three zones together fill every gap row', async () => {
    const { container } = await render(PyramidPlot, {
      width: 500,
      height: 400,
      series: [MUJERES],
      styles: {
        gaps: { default: { start: { x: 0 }, middle: {}, end: { x: 0 } } } satisfies GapsConfig<BarSegmentStyle>,
      },
    });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(MUJERES_2022_WITH_GAPS.length);
  });
});

describe('PyramidPlot – gaps (sign correctness)', () => {
  test('a series on the left keeps its filled bars negative; a series on the right keeps them positive', async () => {
    // 'Mujeres' < 'Varones' alphabetically, so 'Mujeres' renders on the left
    // (negative x) and 'Varones' on the right (positive x).
    const { container } = await render(PyramidPlot, {
      width: 500,
      height: 400,
      series: [MUJERES, VARONES],
      styles: { gaps: { Mujeres: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    const groups = svg.querySelectorAll('g.bar-x');
    // Mujeres: real (12 rects) + gap-fill (2 rects); Varones: real (18 rects, no gaps).
    expect(groups.length).toBe(3);
    const mujeresGapRect = groups[1].querySelector('rect')!;
    const mujeresX = Number(mujeresGapRect.getAttribute('transform')?.match(/translate\(([^,]+),/)?.[1]);
    const varonesX = Number(groups[2].querySelector('rect')!.getAttribute('transform')?.match(/translate\(([^,]+),/)?.[1]);
    // The diverging baseline sits at the plot's horizontal midpoint —
    // Mujeres's bar should extend left of it (smaller x), Varones's right.
    expect(mujeresX).toBeLessThan(varonesX);
  });
});

describe('PyramidPlot – gaps (styling)', () => {
  afterEach(() => resetConfiguration());

  test('a zone with no `style` falls back to `cfg.pyramid.gap`, not a hardcoded default', async () => {
    setConfiguration({ pyramid: { gap: { fillOpacity: 0.3 } } });
    const { container } = await render(PyramidPlot, {
      width: 500,
      height: 400,
      series: [MUJERES],
      styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    const styles = Array.from(svg.querySelectorAll('g.bar-x rect')).map((r) => r.getAttribute('style') ?? '');
    expect(styles.some((s) => s.includes('fill-opacity: 0.3'))).toBe(true);
  });

  test("a zone's own `style` still overrides the global default", async () => {
    setConfiguration({ pyramid: { gap: { fillOpacity: 0.3 } } });
    const { container } = await render(PyramidPlot, {
      width: 500,
      height: 400,
      series: [MUJERES],
      styles: {
        gaps: { default: { middle: { style: { fillOpacity: 0.9 } } } } satisfies GapsConfig<BarSegmentStyle>,
      },
    });
    const svg = await waitForSvg(container);
    const styles = Array.from(svg.querySelectorAll('g.bar-x rect')).map((r) => r.getAttribute('style') ?? '');
    expect(styles.some((s) => s.includes('fill-opacity: 0.9'))).toBe(true);
    expect(styles.some((s) => s.includes('fill-opacity: 0.3'))).toBe(false);
  });
});

describe('PyramidPlot – gaps (series-aware)', () => {
  test('a named entry (keyed by series name) fills only that series', async () => {
    const { container } = await render(PyramidPlot, {
      width: 500,
      height: 400,
      series: [MUJERES, VARONES],
      styles: { gaps: { Mujeres: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(REAL_COUNT + VARONES.data.length + 2);
  });
});

describe('PyramidPlot – gaps (value labels)', () => {
  test('a gap row never gets a value label, filled or not', async () => {
    const { container } = await render(PyramidPlot, {
      width: 500,
      height: 400,
      series: [MUJERES],
      styles: {
        values: { show: true },
        gaps: { default: { middle: {} } },
      } satisfies GapsAwarePlotStylesConfig<BarSegmentStyle>,
    });
    const svg = await waitForSvg(container);
    expect(countTextLabels(svg)).toBe(REAL_COUNT);
  });
});

// ── Legend / hover-isolate dimming ──────────────────────────────────────────
// Unlike LinePlot's gap bridge (a separate marker `buildGapMarkers.ts` never
// wired to the disabled override — see the LinePlot legend/gaps tests for
// that bug), `buildPyramidBarMarkers.ts` already threads the same
// `disabledFillFor` through its gap-fill loop as its real-segment loop.
// These are regression tests confirming that stays true, not a bugfix.

describe('PyramidPlot – gaps (hover-isolate dimming)', () => {
  test('isolating one series dims its gap-fill bars exactly like its real ones', async () => {
    const { container } = await render(PyramidPlot, {
      width: 500,
      height: 400,
      series: [MUJERES, VARONES],
      styles: {
        values: { show: true, hoverIsolate: true, format: (v: number, name: string) => `${name}: ${v}` },
        gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle>,
      },
    });
    const svg = await waitForSvg(container);

    const varonesLabelGroup = Array.from(svg.querySelectorAll('g[role="presentation"]')).find((g) =>
      g.textContent?.includes('Varones'),
    );
    expect(varonesLabelGroup).toBeTruthy();
    varonesLabelGroup!.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));

    await vi.waitFor(() => {
      const dimmedCount = Array.from(svg.querySelectorAll('g.bar-x rect')).filter((r) =>
        r.getAttribute('style')?.includes('fill-opacity: 0.12'),
      ).length;
      if (dimmedCount === 0) throw new Error('nothing dimmed yet');
    });

    const rects = Array.from(svg.querySelectorAll('g.bar-x rect'));
    const dimmed = rects.filter((r) => r.getAttribute('style')?.includes('fill-opacity: 0.12'));
    // Every one of Mujeres's bars — its `REAL_COUNT` real ones plus the 2
    // gap-fill bars the middle zone adds — dims, not just the real ones.
    expect(dimmed).toHaveLength(REAL_COUNT + 2);
  });
});
