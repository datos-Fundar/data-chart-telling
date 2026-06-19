import { describe, test, expect, vi, afterEach } from 'vitest';
import { buildGroupedSeries, validateSegments } from '$lib/plots/utils/segments';
import type { Series } from '$lib/types/plots/common';

// ── Shared fixtures ───────────────────────────────────────────────────────────

type P = { x: number; y: number };

const DATA: P[] = [
  { x: 1, y: 10 },
  { x: 2, y: 20 },
  { x: 3, y: 30 },
  { x: 4, y: 40 },
  { x: 5, y: 50 },
];

const SERIES: Series<P> = { name: 'a', x: 'x', y: 'y', data: DATA };

const xs = (groups: ReturnType<typeof buildGroupedSeries<Series<P>>>, groupIdx = 0, segIdx = 0) =>
  groups[groupIdx].visualSegments[segIdx].data.map(d => d.x);

afterEach(() => vi.restoreAllMocks());

// ── buildGroupedSeries ─────────────────────────────────────────────────────────

describe('buildGroupedSeries – no segments entry', () => {
  test('returns one visual group per series', () => {
    const groups = buildGroupedSeries([SERIES], {});
    expect(groups).toHaveLength(1);
    expect(groups[0].series).toBe(SERIES);
  });

  test('whole dataset in a single visual segment', () => {
    const groups = buildGroupedSeries([SERIES], {});
    expect(groups[0].visualSegments).toHaveLength(1);
    expect(groups[0].visualSegments[0].data).toEqual(DATA);
  });

  test('style defaults to empty object', () => {
    const groups = buildGroupedSeries([SERIES], {});
    expect(groups[0].visualSegments[0].style).toEqual({});
  });

  test('empty ranges array behaves the same as no entry', () => {
    const groups = buildGroupedSeries([SERIES], { a: [] });
    expect(groups[0].visualSegments[0].data).toEqual(DATA);
  });
});

describe('buildGroupedSeries – range filtering', () => {
  test('open-end range: no `from` includes all data up to `to` (inclusive)', () => {
    const groups = buildGroupedSeries([SERIES], { a: [{ to: 3 }] });
    expect(xs(groups)).toEqual([1, 2, 3]);
  });

  test('open-start range: no `to` includes all data from `from` (inclusive)', () => {
    const groups = buildGroupedSeries([SERIES], { a: [{ from: 3 }] });
    expect(xs(groups)).toEqual([3, 4, 5]);
  });

  test('closed range [from, to] filters both ends inclusively', () => {
    const groups = buildGroupedSeries([SERIES], { a: [{ from: 2, to: 4 }] });
    expect(xs(groups)).toEqual([2, 3, 4]);
  });

  test('range wider than data returns all data', () => {
    const groups = buildGroupedSeries([SERIES], { a: [{ from: 0, to: 99 }] });
    expect(groups[0].visualSegments[0].data).toEqual(DATA);
  });

  test('range with no matching data returns empty data array', () => {
    const groups = buildGroupedSeries([SERIES], { a: [{ from: 10, to: 20 }] });
    expect(groups[0].visualSegments[0].data).toHaveLength(0);
  });
});

describe('buildGroupedSeries – segment continuity', () => {
  test('two adjacent segments both include the shared boundary point', () => {
    const groups = buildGroupedSeries([SERIES], { a: [{ to: 3 }, { from: 3 }] });
    const [seg1, seg2] = groups[0].visualSegments;
    expect(xs(groups, 0, 0)).toContain(3);
    expect(xs(groups, 0, 1)).toContain(3);
    // The boundary point appears in both, so lines connect without a gap
    expect(seg1.data.at(-1)).toEqual(seg2.data[0]);
  });

  test('produces one visual segment per range definition', () => {
    const groups = buildGroupedSeries([SERIES], {
      a: [{ to: 2 }, { from: 2, to: 4 }, { from: 4 }],
    });
    expect(groups[0].visualSegments).toHaveLength(3);
  });
});

describe('buildGroupedSeries – styles', () => {
  test('style is passed through to the visual segment', () => {
    const style = { stroke: '#ff0000', strokeWidth: 3, strokeDasharray: '4 2' };
    const groups = buildGroupedSeries([SERIES], { a: [{ style }] });
    expect(groups[0].visualSegments[0].style).toEqual(style);
  });

  test('omitted style defaults to empty object', () => {
    const groups = buildGroupedSeries([SERIES], { a: [{ from: 1, to: 3 }] });
    expect(groups[0].visualSegments[0].style).toEqual({});
  });

  test('different segments may have different styles', () => {
    const groups = buildGroupedSeries([SERIES], {
      a: [
        { to: 3,   style: { stroke: '#aaa' } },
        { from: 3, style: { stroke: '#bbb', strokeDasharray: '6 3' } },
      ],
    });
    expect(groups[0].visualSegments[0].style.stroke).toBe('#aaa');
    expect(groups[0].visualSegments[1].style.stroke).toBe('#bbb');
    expect(groups[0].visualSegments[1].style.strokeDasharray).toBe('6 3');
  });
});

describe('buildGroupedSeries – multiple series', () => {
  test('returns one group per series in the same order', () => {
    const b: Series<P> = { name: 'b', x: 'x', y: 'y', data: DATA };
    const groups = buildGroupedSeries([SERIES, b], {});
    expect(groups[0].series.name).toBe('a');
    expect(groups[1].series.name).toBe('b');
  });

  test('segments are applied per series independently', () => {
    const b: Series<P> = { name: 'b', x: 'x', y: 'y', data: DATA };
    const groups = buildGroupedSeries([SERIES, b], {
      a: [{ to: 2 }],
      // no entry for 'b' → whole data
    });
    expect(xs(groups, 0)).toEqual([1, 2]);
    expect(xs(groups, 1)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('buildGroupedSeries – function accessor', () => {
  test('works with a function accessor for x', () => {
    const s: Series<P> = { name: 'fn', x: d => d.x, y: d => d.y, data: DATA };
    const groups = buildGroupedSeries([s], { fn: [{ from: 3 }] });
    expect(xs(groups)).toEqual([3, 4, 5]);
  });
});

// ── validateSegments ──────────────────────────────────────────────────────────

describe('validateSegments', () => {
  test('does not warn for a single open-start range', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    validateSegments({ a: [{ to: 3 }, { from: 3 }] });
    expect(warn).not.toHaveBeenCalled();
  });

  test('warns when two or more ranges omit `from`', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    validateSegments({ a: [{ to: 2 }, { to: 4 }] });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no 'from'"));
  });

  test('warns when two or more ranges omit `to`', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    validateSegments({ a: [{ from: 1 }, { from: 3 }] });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no 'to'"));
  });

  test('warning message includes the series name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    validateSegments({ mySeries: [{ to: 1 }, { to: 3 }] });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('mySeries'));
  });

  test('validates each series independently', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    validateSegments({
      good: [{ to: 3 }, { from: 3 }],          // valid
      bad:  [{ from: 1 }, { from: 3 }],         // two open ends
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('bad'));
  });

  test('does not warn for empty segments map', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    validateSegments({});
    expect(warn).not.toHaveBeenCalled();
  });
});
