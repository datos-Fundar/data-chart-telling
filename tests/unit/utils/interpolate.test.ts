import { describe, test, expect } from 'vitest';
import { resolveEasing, interpolateSeries, resolveTimelineInterpolation } from '$lib/utils/interpolate';

// ── resolveEasing ─────────────────────────────────────────────────────────────

describe('resolveEasing', () => {
  test('defaults to linear when omitted', () => {
    const ease = resolveEasing();
    expect(ease(0.3)).toBe(0.3);
  });

  test('resolves a named easing', () => {
    const ease = resolveEasing('quadIn');
    expect(ease(0.5)).toBeCloseTo(0.25);
  });

  test('falls back to linear for an unknown name', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ease = resolveEasing('bogus' as any);
    expect(ease(0.4)).toBe(0.4);
  });

  test('passes a function through unchanged', () => {
    const custom = (t: number) => t * 2;
    expect(resolveEasing(custom)).toBe(custom);
  });
});

// ── interpolateSeries ─────────────────────────────────────────────────────────

type Row = { year: number; value: number };

const ROWS: Row[] = [
  { year: 2018, value: 10 },
  { year: 2020, value: 30 },
  { year: 2022, value: 50 },
];

const getTime = (r: Row) => r.year;
const getValue = (r: Row) => r.value;
const create = (_lower: Row, upper: Row, x: number, value: number): Row => ({ ...upper, year: x, value });
const linear = (t: number) => t;

describe('interpolateSeries', () => {
  test('clamps to the first row when x is before the range', () => {
    const result = interpolateSeries({ rows: ROWS, x: 2010, getTime, getValue, create, segmentEasing: linear });
    expect(result).toEqual([ROWS[0]]);
  });

  test('holds the last row when x is at or after the range', () => {
    const result = interpolateSeries({ rows: ROWS, x: 2022, getTime, getValue, create, segmentEasing: linear });
    expect(result.at(-1)).toEqual(ROWS[2]);

    const past = interpolateSeries({ rows: ROWS, x: 2030, getTime, getValue, create, segmentEasing: linear });
    expect(past.at(-1)).toEqual(ROWS[2]);
  });

  test('tweens the value and x at the midpoint between two real rows', () => {
    const result = interpolateSeries({ rows: ROWS, x: 2019, getTime, getValue, create, segmentEasing: linear });
    // [first real row up to the bracket, synthetic tween row]
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(ROWS[0]);
    expect(result[1].year).toBe(2019);
    expect(result[1].value).toBeCloseTo(20); // halfway between 10 and 30
  });

  test('includes every fully-passed real row before the bracket', () => {
    const result = interpolateSeries({ rows: ROWS, x: 2021, getTime, getValue, create, segmentEasing: linear });
    expect(result.map((r) => r.year)).toEqual([2018, 2020, 2021]);
    expect(result.at(-1)!.value).toBeCloseTo(40); // halfway between 30 and 50
  });

  test('applies segmentEasing to the local tween fraction', () => {
    const quadIn = resolveEasing('quadIn');
    const result = interpolateSeries({ rows: ROWS, x: 2019, getTime, getValue, create, segmentEasing: quadIn });
    // local t = 0.5 → quadIn(0.5) = 0.25 → 10 + (30-10)*0.25 = 15
    expect(result[1].value).toBeCloseTo(15);
  });

  test('unsorted input rows do not affect the result', () => {
    const shuffled = [ROWS[2], ROWS[0], ROWS[1]];
    const result = interpolateSeries({ rows: shuffled, x: 2019, getTime, getValue, create, segmentEasing: linear });
    expect(result[1].value).toBeCloseTo(20);
  });

  test('returns an empty array for no rows', () => {
    expect(interpolateSeries({ rows: [], x: 2020, getTime, getValue, create, segmentEasing: linear })).toEqual([]);
  });
});

// ── resolveTimelineInterpolation ──────────────────────────────────────────────

describe('resolveTimelineInterpolation', () => {
  test('returns undefined when interpolate is falsy', () => {
    expect(resolveTimelineInterpolation(undefined, { value: 'value' })).toBeUndefined();
  });

  test('`true` resolves to the chart-supplied defaults', () => {
    const resolved = resolveTimelineInterpolation(true, { value: 'value', key: 'region' });
    expect(resolved).toEqual({ value: 'value', key: 'region' });
  });

  test('an explicit object overrides the defaults but keeps unspecified fields', () => {
    const resolved = resolveTimelineInterpolation(
      { progressEasing: 'quartOut' },
      { value: 'value', key: 'region' },
    );
    expect(resolved).toEqual({ value: 'value', key: 'region', progressEasing: 'quartOut' });
  });

  test('a `value`/`key` already present on the config wins over the defaults', () => {
    const resolved = resolveTimelineInterpolation(
      { value: 'count', key: 'metric' },
      { value: 'value', key: 'region' },
    );
    expect(resolved).toEqual({ value: 'count', key: 'metric' });
  });
});
