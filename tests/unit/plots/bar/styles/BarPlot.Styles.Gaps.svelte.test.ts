import { render } from 'vitest-browser-svelte';
import { describe, test, expect, afterEach, vi } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import { READINGS_WITH_GAPS, OTHER_READINGS_NO_GAPS } from '../../../../../stories/plots/bar/data';
import { waitForSvg, countBarRects, countTextLabels } from '../../_helpers/svg';

const SERIES = { name: 'reading', x: 'category' as const, y: 'value' as const, data: READINGS_WITH_GAPS };
const OTHER_SERIES = { name: 'other', x: 'category' as const, y: 'value' as const, data: OTHER_READINGS_NO_GAPS };
const REAL_COUNT = READINGS_WITH_GAPS.filter((d) => d.value != null).length;

describe('BarPlot – gaps (no config)', () => {
  test('a missing value renders no bar, not a fake-zero one', async () => {
    const { container } = await render(BarPlot, { width: 400, height: 300, series: [SERIES] });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(REAL_COUNT);
  });
});

describe('BarPlot – gaps (middle)', () => {
  test('fills the internal gap with two additional bars', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [SERIES],
      styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(REAL_COUNT + 2);
  });
});

describe('BarPlot – gaps (start/end, opt-in)', () => {
  test('a start zone only fills once an explicit `x` target is given', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [SERIES],
      styles: { gaps: { default: { start: { x: 0 } } } satisfies GapsConfig<BarSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(REAL_COUNT + 2);
  });

  test('an end zone only fills once an explicit `x` target is given', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [SERIES],
      styles: { gaps: { default: { end: { x: 13 } } } satisfies GapsConfig<BarSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(REAL_COUNT + 2);
  });

  test('all three zones together fill every gap row', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [SERIES],
      styles: {
        gaps: { default: { start: { x: 0 }, middle: {}, end: { x: 13 } } } satisfies GapsConfig<BarSegmentStyle>,
      },
    });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(READINGS_WITH_GAPS.length);
  });
});

describe('BarPlot – gaps (styling)', () => {
  afterEach(() => resetConfiguration());

  test('a zone with no `style` falls back to `cfg.bar.gap`, not a hardcoded default', async () => {
    setConfiguration({ bar: { gap: { fillOpacity: 0.3 } } });
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [SERIES],
      styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    const styles = Array.from(svg.querySelectorAll('g.bar-y rect')).map((r) => r.getAttribute('style') ?? '');
    expect(styles.some((s) => s.includes('fill-opacity: 0.3'))).toBe(true);
  });

  test("a zone's own `style` still overrides the global default", async () => {
    setConfiguration({ bar: { gap: { fillOpacity: 0.3 } } });
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [SERIES],
      styles: {
        gaps: { default: { middle: { style: { fillOpacity: 0.9 } } } } satisfies GapsConfig<BarSegmentStyle>,
      },
    });
    const svg = await waitForSvg(container);
    const styles = Array.from(svg.querySelectorAll('g.bar-y rect')).map((r) => r.getAttribute('style') ?? '');
    expect(styles.some((s) => s.includes('fill-opacity: 0.9'))).toBe(true);
    expect(styles.some((s) => s.includes('fill-opacity: 0.3'))).toBe(false);
  });
});

describe('BarPlot – gaps (series-aware)', () => {
  test('a named entry (keyed by series name) fills only that series', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [SERIES, OTHER_SERIES],
      styles: { gaps: { reading: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(REAL_COUNT + OTHER_READINGS_NO_GAPS.length + 2);
  });

  test('`default` applies to every series with no named entry of its own', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [SERIES, OTHER_SERIES],
      styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    // `other` has no missing values, so `default` has nothing to fill there.
    expect(countBarRects(svg)).toBe(REAL_COUNT + OTHER_READINGS_NO_GAPS.length + 2);
  });
});

describe('BarPlot – gaps (value labels)', () => {
  test('a gap row never gets a value label, filled or not', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [SERIES],
      styles: {
        values: { show: true },
        gaps: { default: { middle: {} } },
      } satisfies GapsAwarePlotStylesConfig<BarSegmentStyle>,
    });
    const svg = await waitForSvg(container);
    expect(countTextLabels(svg)).toBe(REAL_COUNT);
  });
});

describe('BarPlot – gaps (hover)', () => {
  test('a category whose only row is an unfilled gap gets no hit area', async () => {
    const { container } = await render(BarPlot, { width: 400, height: 300, series: [SERIES] });
    const svg = await waitForSvg(container);
    // `:not([pointer-events])` excludes the plot's own background hit-rect
    // (which sets `pointer-events="all"`) — only a bar `role: 'hitArea'`
    // marker's `<rect>` is transparent without it.
    const hitAreas = svg.querySelectorAll('rect[fill="transparent"]:not([pointer-events])');
    expect(hitAreas.length).toBe(REAL_COUNT);
  });
});

describe('BarPlot – gaps (grouped layout)', () => {
  test('a filled gap bar renders alongside a grouped series without dropping either', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [SERIES, OTHER_SERIES],
      scales: { z: { seriesLayout: 'grouped' } },
      styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    expect(countBarRects(svg)).toBe(REAL_COUNT + OTHER_READINGS_NO_GAPS.length + 2);
  });
});

describe('BarPlot – gaps (stacked layout)', () => {
  // A minimal, self-contained fixture (not a story dataset) — three round
  // numbers chosen so the interpolation arithmetic below is easy to verify
  // by hand, independent of any narrative dataset.
  const STACKED_SERIES_A = { name: 'a', x: 'category' as const, y: 'value' as const, data: [
    { category: 'Cat1', value: 10 },
    { category: 'Cat2', value: null },
    { category: 'Cat3', value: 20 },
  ] };
  const STACKED_SERIES_B = { name: 'b', x: 'category' as const, y: 'value' as const, data: [
    { category: 'Cat1', value: 5 },
    { category: 'Cat2', value: 5 },
    { category: 'Cat3', value: 5 },
  ] };

  async function bTopYAtCat2(gaps: GapsConfig<BarSegmentStyle>) {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [STACKED_SERIES_A, STACKED_SERIES_B],
      scales: { z: { seriesLayout: 'stacked' } },
      styles: { gaps } satisfies { gaps: GapsConfig<BarSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    // `b`'s real segment is pushed last (after `a`'s real + any gap-fill
    // marker), and covers all 3 categories in data order — its own <g> is
    // therefore the last `g.bar-y` group, and its 2nd rect is Cat2.
    const groups = svg.querySelectorAll('g.bar-y');
    const bGroup = groups[groups.length - 1];
    const rects = bGroup.querySelectorAll('rect');
    // svelteplot positions a bar rect via `transform: translate(x, y)`, not
    // separate x/y attributes.
    const translate = rects[1].getAttribute('transform') ?? '';
    const match = translate.match(/translate\(([^,]+),([^)]+)\)/);
    return Number(match?.[2]);
  }

  test("an unfilled gap in the series below contributes 0 to the stack baseline (doesn't break the series above)", async () => {
    const unfilledY = await bTopYAtCat2({});
    expect(Number.isNaN(unfilledY)).toBe(false);
  });

  test('a filled gap shifts the baseline of the series stacked above it', async () => {
    const unfilledY = await bTopYAtCat2({});
    const filledY = await bTopYAtCat2({ default: { middle: {} } });
    // A's Cat2 fill (linear ease between 10 and 20 = 15) is taller than the
    // implicit 0 contribution an unfilled gap leaves — b's bar, stacked on
    // top, should sit higher (smaller SVG y = higher on screen) once filled.
    expect(filledY).toBeLessThan(unfilledY);
  });
});

// ── Legend / hover-isolate dimming ──────────────────────────────────────────
// Unlike LinePlot's gap bridge (a separate marker `buildGapMarkers.ts` never
// wired to the disabled override — see the LinePlot legend/gaps tests), this
// file's `buildBarMarkers.ts` already threads the same `disabledFillFor`
// through its gap-fill loop as its real-segment loop (see `style:` in both
// the real-segment and gap-fill loops there) — so bar gap fills were never
// affected by that bug. This is a regression test confirming that stays
// true, not a bugfix.

describe('BarPlot – gaps (hover-isolate dimming)', () => {
  test('isolating one series dims its gap-fill bars exactly like its real ones', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [SERIES, OTHER_SERIES],
      styles: {
        // The default bar `values.format` omits the series name (unlike
        // Line/Pyramid) — supply one so the right label group is findable
        // below.
        values: { show: true, hoverIsolate: true, format: (v: number, name: string) => `${name}: ${v}` },
        gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle>,
      },
    });
    const svg = await waitForSvg(container);

    const otherLabelGroup = Array.from(svg.querySelectorAll('g[role="presentation"]')).find((g) =>
      g.textContent?.includes('other'),
    );
    expect(otherLabelGroup).toBeTruthy();
    otherLabelGroup!.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));

    await vi.waitFor(() => {
      const dimmedCount = Array.from(svg.querySelectorAll('g.bar-y rect')).filter((r) =>
        r.getAttribute('style')?.includes('fill-opacity: 0.12'),
      ).length;
      if (dimmedCount === 0) throw new Error('nothing dimmed yet');
    });

    const rects = Array.from(svg.querySelectorAll('g.bar-y rect'));
    const dimmed = rects.filter((r) => r.getAttribute('style')?.includes('fill-opacity: 0.12'));
    // Every one of `reading`'s bars — its `REAL_COUNT` real ones plus the 2
    // gap-fill bars the middle zone adds — dims, not just the real ones.
    expect(dimmed).toHaveLength(REAL_COUNT + 2);
  });
});
