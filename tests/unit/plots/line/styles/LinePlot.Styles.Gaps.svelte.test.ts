import { render } from 'vitest-browser-svelte';
import { describe, test, expect, afterEach, vi } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import { FEMALE_LIFE_EXPECTANCY_WITH_GAPS, MALE_LIFE_EXPECTANCY_WITH_GAPS } from '../../../../../stories/plots/line/data';
import { waitForSvg, countLinePaths, countDotMarks } from '../../_helpers/svg';

const FEMALE = { name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE_EXPECTANCY_WITH_GAPS };

// A second series whose gap sits in a different place, for series-aware tests.
const MALE = { name: 'male', x: 'year' as const, y: 'value' as const, data: MALE_LIFE_EXPECTANCY_WITH_GAPS };

describe('LinePlot – gaps (no config)', () => {
  test('renders a single path, even though the data has null-value holes', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
    });
    const svg = await waitForSvg(container);
    // svelteplot's own Line mark already breaks visually at null values via
    // d3's `.defined()` — without `gaps`, that's still a single Line marker
    // (one <path> with several disjoint subpaths), not extra paths.
    expect(countLinePaths(svg)).toBe(1);
    expect(countDotMarks(svg)).toBe(0);
  });
});

describe('LinePlot – gaps (middle)', () => {
  test('adds one bridge path for the internal gap when `middle` is configured', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<LineSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    expect(countLinePaths(svg)).toBe(2);
  });

  test('does not add a bridge for the leading/trailing gaps when only `middle` is set', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<LineSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    // 1 base line + 1 middle bridge only — no start/end bridge without an explicit target.
    expect(countLinePaths(svg)).toBe(2);
  });
});

describe('LinePlot – gaps (start/end, opt-in)', () => {
  test('adds a start bridge only once an explicit `x` target is given', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: { gaps: { default: { start: { x: 2006 } } } satisfies GapsConfig<LineSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    expect(countLinePaths(svg)).toBe(2);
  });

  test('adds an end bridge only once an explicit `x` target is given', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: { gaps: { default: { end: { x: 2022 } } } satisfies GapsConfig<LineSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    expect(countLinePaths(svg)).toBe(2);
  });

  test('all three zones configured together add three bridges', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: {
        gaps: {
          default: { start: { x: 2006 }, middle: {}, end: { x: 2022 } },
        } satisfies GapsConfig<LineSegmentStyle>,
      },
    });
    const svg = await waitForSvg(container);
    expect(countLinePaths(svg)).toBe(4);
  });
});

describe('LinePlot – gaps (styling)', () => {
  test('draws no dots at the bridge endpoints unless the zone style requests them', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<LineSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    expect(countDotMarks(svg)).toBe(0);
  });

  test('draws a dot at each of the bridge run endpoints when `dots` is set', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: {
        gaps: {
          default: { middle: { style: { dots: { dotRadius: 4 } } } },
        } satisfies GapsConfig<LineSegmentStyle>,
      },
    });
    const svg = await waitForSvg(container);
    expect(countDotMarks(svg)).toBe(2);
  });

  test('a custom stroke color overrides the default series color on the bridge', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: {
        gaps: {
          default: { middle: { style: { stroke: { stroke: '#16a34a' } } } },
        } satisfies GapsConfig<LineSegmentStyle>,
      },
    });
    const svg = await waitForSvg(container);
    const paths = svg.querySelectorAll('g.lines path');
    const bridgeHasCustomColor = Array.from(paths).some((p) =>
      p.getAttribute('style')?.includes('stroke: rgb(22, 163, 74)'),
    );
    expect(bridgeHasCustomColor).toBe(true);
  });

  test('easing changes the bridge geometry compared to the linear default', async () => {
    async function pathsD(zone: NonNullable<GapsConfig<LineSegmentStyle>['default']>['middle']) {
      const { container } = await render(LinePlot, {
        width: 400,
        height: 300,
        series: [FEMALE],
        styles: { gaps: { default: { middle: zone } } satisfies GapsConfig<LineSegmentStyle> },
      });
      const svg = await waitForSvg(container);
      // The base series path is unaffected by `interpolate` — only the
      // bridge path's `d` changes, so comparing the full set catches it
      // without needing to single out which path is the bridge.
      return Array.from(svg.querySelectorAll('g.lines path')).map((p) => p.getAttribute('d')).sort();
    }
    const linear = await pathsD({});
    const eased = await pathsD({ interpolate: 'expoOut' });
    expect(linear).not.toEqual(eased);
  });
});

// ── Series-aware ──────────────────────────────────────────────────────────────

describe('LinePlot – gaps (series-aware)', () => {
  test('a named entry (keyed by series name) fills only that series', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE, MALE],
      styles: { gaps: { female: { middle: {} } } satisfies GapsConfig<LineSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    // 2 base lines (female + male) + 1 bridge on `female` only.
    expect(countLinePaths(svg)).toBe(3);
  });

  test('`default` applies to every series with no named entry of its own', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE, MALE],
      styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<LineSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    // 2 base lines + a middle bridge on each of the two series.
    expect(countLinePaths(svg)).toBe(4);
  });

  test('a named entry overrides `default` per zone, not per series', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE, MALE],
      styles: {
        gaps: {
          default: { start: { x: 2006 }, middle: {} },
          // `female` overrides only `middle`; it still inherits `start` from `default`.
          female: { middle: { style: { stroke: { stroke: '#16a34a' } } } },
        } satisfies GapsConfig<LineSegmentStyle>,
      },
    });
    const svg = await waitForSvg(container);
    // `female`: 1 base + 1 start bridge (inherited) + 1 middle bridge = 3.
    // `male` has no leading gap (its only hole is internal), so `start` is a
    // no-op for it: 1 base + 1 middle bridge = 2. Total 5.
    expect(countLinePaths(svg)).toBe(5);
    const bridgeHasCustomColor = Array.from(svg.querySelectorAll('g.lines path')).some((p) =>
      p.getAttribute('style')?.includes('stroke: rgb(22, 163, 74)'),
    );
    expect(bridgeHasCustomColor).toBe(true);
  });
});

// ── Global configuration ──────────────────────────────────────────────────────

describe('LinePlot – gaps (cfg.line.gap)', () => {
  afterEach(() => resetConfiguration());

  test('a zone with no `style` falls back to `cfg.line.gap`, not a hardcoded default', async () => {
    setConfiguration({ line: { gap: { stroke: { strokeDasharray: '2 2', strokeOpacity: 0.9 } } } });
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<LineSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    const bridgeStyle = Array.from(svg.querySelectorAll('g.lines path'))
      .map((p) => p.getAttribute('style') ?? '')
      .find((s) => s.includes('stroke-dasharray: 2, 2') || s.includes('stroke-dasharray: 2 2'));
    expect(bridgeStyle).toBeTruthy();
  });

  test('a zone\'s own `style` still overrides the global default', async () => {
    setConfiguration({ line: { gap: { stroke: { strokeDasharray: '2 2' } } } });
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: {
        gaps: {
          default: { middle: { style: { stroke: { strokeDasharray: '9 1' } } } },
        } satisfies GapsConfig<LineSegmentStyle>,
      },
    });
    const svg = await waitForSvg(container);
    const styles = Array.from(svg.querySelectorAll('g.lines path')).map((p) => p.getAttribute('style') ?? '');
    expect(styles.some((s) => s.includes('9, 1') || s.includes('9 1'))).toBe(true);
    expect(styles.some((s) => s.includes('2, 2') || s.includes('2 2'))).toBe(false);
  });

  test('`cfg.line.gap.dots` supplies default dot geometry once a zone opts in with `style.dots`', async () => {
    setConfiguration({ line: { gap: { dots: { dotRadius: 9 } } } });
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: { gaps: { default: { middle: { style: { dots: {} } } } } satisfies GapsConfig<LineSegmentStyle> },
    });
    const svg = await waitForSvg(container);
    expect(countDotMarks(svg)).toBe(2);
  });
});

// ── Legend / hover-isolate dimming ──────────────────────────────────────────
// A gap bridge is drawn by its own, separate `'line'`/`'dot'` marker (see
// `buildGapMarkers.ts`) — it must dim the same way the real line does when
// its series is disabled, whether via a legend click or `styles.values.
// hoverIsolate`. The legend-click path is covered end-to-end in
// `tests/unit/plots/line/legend/LinePlot.Legend.GapsDisable.svelte.test.ts`;
// the override precedence itself (disabled stroke/dots beating the zone's
// own style beating the shared default) is covered directly, as a pure
// function, in `buildGapMarkers.svelte.test.ts`. This covers the other
// repro path: `styles.values.hoverIsolate`.

// The interpolated bridge samples `BRIDGE_STEPS + 1` (25) points — far more
// `L` commands than the 1–2-point-per-subpath real line ever produces for
// these small fixtures — which is what tells a bridge path apart from a real
// one purely from its rendered `d`.
function bridgePaths(svg: SVGElement): SVGPathElement[] {
  return Array.from(svg.querySelectorAll<SVGPathElement>('g.lines path')).filter(
    (p) => (p.getAttribute('d')?.match(/L/g)?.length ?? 0) > 10,
  );
}

describe('LinePlot – gaps (hover-isolate dimming)', () => {
  test('hovering one series\' value label dims the OTHER series\' gap bridge, not its own', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE, MALE],
      styles: {
        values: { show: true, hoverIsolate: true },
        gaps: { default: { middle: {} } } satisfies GapsConfig<LineSegmentStyle>,
      },
    });
    const svg = await waitForSvg(container);

    const labelGroups = Array.from(svg.querySelectorAll('g[role="presentation"]'));
    const femaleLabelGroup = labelGroups.find((g) => g.textContent?.includes('female'));
    expect(femaleLabelGroup).toBeTruthy();
    femaleLabelGroup!.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));

    await vi.waitFor(() => {
      const dimmed = bridgePaths(svg).some((p) => p.getAttribute('style')?.includes('stroke-opacity: 0.12'));
      if (!dimmed) throw new Error('bridge not yet dimmed');
    });

    const bridges = bridgePaths(svg);
    expect(bridges).toHaveLength(2);
    const opacities = bridges.map((p) => p.getAttribute('style') ?? '');
    // male — isolated out by hovering female's label — dims to the shared
    // legend `disabledOpacity` (0.12), same as its real line would.
    expect(opacities.some((s) => s.includes('stroke-opacity: 0.12'))).toBe(true);
    // female's own bridge is untouched: still the plain gap default (0.6).
    expect(opacities.some((s) => s.includes('stroke-opacity: 0.6'))).toBe(true);
  });

  // No "leaving the label undims it again" counterpart here: a synthetic
  // `pointerleave` dispatch never clears `hoverIsolatedSeries` in this
  // browser test setup — reproducible with `styles.gaps` entirely absent,
  // on the *real* line's own dimming, so it's unrelated to this fix (and
  // untested territory already, not a regression this change introduces).
});
