import { describe, test, expect } from 'vitest';
import { resolveGapRuns, resolveGapsForSeries, isGapValue } from '$lib/plots/utils/gaps';
import { resolveEasing } from '$lib/utils/interpolate';
import type { Series } from '$lib/types/plots/data/common';
import type { GapZonesConfig } from '$lib/types/plots/gaps';

// ── Shared fixtures ───────────────────────────────────────────────────────────

type P = { x: number; y: number | null };

// Leading gap (x 1-2), one internal gap (x 5), trailing gap (x 8).
const DATA: P[] = [
  { x: 1, y: null },
  { x: 2, y: null },
  { x: 3, y: 30 },
  { x: 4, y: 40 },
  { x: 5, y: null },
  { x: 6, y: 60 },
  { x: 7, y: 70 },
  { x: 8, y: null },
];

const SERIES: Series<P> = { name: 'a', x: 'x', y: 'y', data: DATA };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Style = any;

// ── isGapValue ────────────────────────────────────────────────────────────────

describe('isGapValue', () => {
  test('null, undefined and NaN are gap values', () => {
    expect(isGapValue(null)).toBe(true);
    expect(isGapValue(undefined)).toBe(true);
    expect(isGapValue(NaN)).toBe(true);
  });

  test('a real number, including zero, is not a gap value', () => {
    expect(isGapValue(0)).toBe(false);
    expect(isGapValue(-5)).toBe(false);
    expect(isGapValue(12.4)).toBe(false);
  });
});

// ── No config ─────────────────────────────────────────────────────────────────

describe('resolveGapRuns - no config', () => {
  test('returns nothing when no zone is configured', () => {
    expect(resolveGapRuns<P, Style>(SERIES, {})).toEqual([]);
  });

  test('returns nothing for a series with no valid rows at all', () => {
    const allGaps: Series<P> = { name: 'a', x: 'x', y: 'y', data: [{ x: 1, y: null }, { x: 2, y: NaN }] };
    expect(resolveGapRuns<P, Style>(allGaps, { start: { x: 0 }, middle: {}, end: { x: 10 } })).toEqual([]);
  });
});

// ── Middle gaps ───────────────────────────────────────────────────────────────

describe('resolveGapRuns - middle', () => {
  test('bridges the internal run between its two real boundary points', () => {
    const runs = resolveGapRuns<P, Style>(SERIES, { middle: {} });
    expect(runs).toHaveLength(1);
    expect(runs[0].kind).toBe('middle');
    const points = runs[0].points;
    expect(points[0]).toEqual({ x: 4, y: 40 });
    expect(points[points.length - 1]).toEqual({ x: 6, y: 60 });
  });

  test('is a no-op when `middle` is not configured, even with an internal gap', () => {
    expect(resolveGapRuns<P, Style>(SERIES, {})).toHaveLength(0);
  });

  test('bridges every internal gap when there is more than one', () => {
    const twoGaps: P[] = [
      { x: 1, y: 10 },
      { x: 2, y: null },
      { x: 3, y: 30 },
      { x: 4, y: null },
      { x: 5, y: 50 },
    ];
    const runs = resolveGapRuns<P, Style>(
      { name: 'a', x: 'x', y: 'y', data: twoGaps },
      { middle: {} },
    );
    expect(runs.map((r) => r.kind)).toEqual(['middle', 'middle']);
    expect(runs[0].points[0]).toEqual({ x: 1, y: 10 });
    expect(runs[0].points[runs[0].points.length - 1]).toEqual({ x: 3, y: 30 });
    expect(runs[1].points[0]).toEqual({ x: 3, y: 30 });
    expect(runs[1].points[runs[1].points.length - 1]).toEqual({ x: 5, y: 50 });
  });

  test('easing shapes the interpolated Y, not the X spacing', () => {
    const linear = resolveGapRuns<P, Style>(SERIES, { middle: {} })[0].points;
    const eased = resolveGapRuns<P, Style>(SERIES, { middle: { interpolate: 'quadIn' } })[0].points;
    const mid = Math.floor(linear.length / 2);
    // X progresses identically regardless of easing.
    expect(eased[mid].x).toBe(linear[mid].x);
    // Y follows the quadIn curve instead of a straight line.
    const t = mid / (linear.length - 1);
    const expectedY = 40 + (60 - 40) * resolveEasing('quadIn')(t);
    expect(eased[mid].y).toBeCloseTo(expectedY);
    expect(eased[mid].y).not.toBeCloseTo(linear[mid].y);
  });
});

// ── Start (leading) gaps ────────────────────────────────────────────────────────

describe('resolveGapRuns - start', () => {
  test('is a no-op without an explicit `x`, even with a leading gap', () => {
    expect(resolveGapRuns<P, Style>(SERIES, {})).toHaveLength(0);
  });

  test('bridges from the configured x to the first real point', () => {
    const runs = resolveGapRuns<P, Style>(SERIES, { start: { x: 0 } });
    expect(runs).toHaveLength(1);
    expect(runs[0].kind).toBe('start');
    const points = runs[0].points;
    expect(points[0].x).toBe(0);
    expect(points[points.length - 1]).toEqual({ x: 3, y: 30 });
  });

  test('defaults the target Y to a flat hold of the first real value', () => {
    const points = resolveGapRuns<P, Style>(SERIES, { start: { x: 0 } })[0].points;
    expect(points.every((p) => p.y === 30)).toBe(true);
  });

  test('an explicit target Y overrides the flat-hold default', () => {
    const points = resolveGapRuns<P, Style>(SERIES, { start: { x: 0, y: 10 } })[0].points;
    expect(points[0]).toEqual({ x: 0, y: 10 });
    expect(points[points.length - 1]).toEqual({ x: 3, y: 30 });
  });

  test('does nothing when the series has no leading gap', () => {
    const noLeadingGap: P[] = [{ x: 1, y: 10 }, { x: 2, y: 20 }];
    const runs = resolveGapRuns<P, Style>(
      { name: 'a', x: 'x', y: 'y', data: noLeadingGap },
      { start: { x: 0 } },
    );
    expect(runs).toHaveLength(0);
  });
});

// ── End (trailing) gaps ──────────────────────────────────────────────────────────

describe('resolveGapRuns - end', () => {
  test('is a no-op without an explicit `x`, even with a trailing gap', () => {
    expect(resolveGapRuns<P, Style>(SERIES, {})).toHaveLength(0);
  });

  test('bridges from the last real point to the configured x', () => {
    const runs = resolveGapRuns<P, Style>(SERIES, { end: { x: 10 } });
    expect(runs).toHaveLength(1);
    expect(runs[0].kind).toBe('end');
    const points = runs[0].points;
    expect(points[0]).toEqual({ x: 7, y: 70 });
    expect(points[points.length - 1].x).toBe(10);
  });

  test('defaults the target Y to a flat hold of the last real value', () => {
    const points = resolveGapRuns<P, Style>(SERIES, { end: { x: 10 } })[0].points;
    expect(points.every((p) => p.y === 70)).toBe(true);
  });
});

// ── All three zones together ─────────────────────────────────────────────────────

describe('resolveGapRuns - start, middle and end together', () => {
  test('resolves one run per zone, in start → middle → end order', () => {
    const gaps: GapZonesConfig<Style> = { start: { x: 0 }, middle: {}, end: { x: 10 } };
    const runs = resolveGapRuns<P, Style>(SERIES, gaps);
    expect(runs.map((r) => r.kind)).toEqual(['start', 'middle', 'end']);
  });
});

// ── resolveGapsForSeries (series-aware resolution) ───────────────────────────────

describe('resolveGapsForSeries', () => {
  test('returns an empty config when neither a named nor a default entry exists', () => {
    expect(resolveGapsForSeries<Style>({}, 'female')).toEqual({});
  });

  test('a named entry with no default falls through unchanged', () => {
    const gaps = { female: { middle: {} } };
    expect(resolveGapsForSeries<Style>(gaps, 'female')).toBe(gaps.female);
  });

  test('falls back to `default` for a series with no named entry', () => {
    const gaps = { default: { middle: {} } };
    expect(resolveGapsForSeries<Style>(gaps, 'female')).toBe(gaps.default);
  });

  test('a named entry is scoped to that series only - an unrelated series gets nothing', () => {
    const gaps = { female: { middle: {} } };
    expect(resolveGapsForSeries<Style>(gaps, 'male')).toEqual({});
  });

  test('merges at zone granularity: a named zone wins, an unset zone falls back to default', () => {
    const gaps = {
      default: { start: { x: 0 }, middle: {}, end: { x: 10 } },
      female: { middle: { interpolate: 'quadIn' as const } },
    };
    const resolved = resolveGapsForSeries<Style>(gaps, 'female');
    // `middle` comes from the named entry…
    expect(resolved.middle).toBe(gaps.female.middle);
    // …while `start`/`end` fall back to `default`, since `female` leaves them unset.
    expect(resolved.start).toBe(gaps.default.start);
    expect(resolved.end).toBe(gaps.default.end);
  });
});
