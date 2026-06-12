import { describe, test, expect } from 'vitest';
import type { DeltaTarget, DeltaConfig } from '$lib/types/plots/lines';

// ── DeltaTarget ──────────────────────────────────────────────────────────────

describe('DeltaTarget – series-based', () => {
  test('targets a series by name', () => {
    const target: DeltaTarget = { type: 'series', series: 'revenue' };
    expect(target.type).toBe('series');
    expect(target.series).toBe('revenue');
  });

  test('accepts any series name string', () => {
    const names = ['revenue', 'expenses', 'profit-margin', 'user_count'];
    for (const name of names) {
      const target: DeltaTarget = { type: 'series', series: name };
      expect(target.series).toBe(name);
    }
  });
});

describe('DeltaTarget – axis-based', () => {
  test('targets X axis with optional value', () => {
    const target: DeltaTarget = { type: 'axis', axis: 'x' };
    expect(target.type).toBe('axis');
    expect(target.axis).toBe('x');
  });

  test('targets Y axis with optional value', () => {
    const target: DeltaTarget = { type: 'axis', axis: 'y' };
    expect(target.type).toBe('axis');
    expect(target.axis).toBe('y');
  });

  test('axis target can include a baseline value', () => {
    const target: DeltaTarget = { type: 'axis', axis: 'y', value: 0 };
    expect(target.value).toBe(0);
  });
});

// ── DeltaConfig ──────────────────────────────────────────────────────────────

describe('DeltaConfig – basic structure', () => {
  test('has required `at` position', () => {
    const config: DeltaConfig = {
      at: 2020,
      from: { type: 'series', series: 'revenue' },
    };
    expect(config.at).toBe(2020);
  });

  test('`at` can be a number (X axis position)', () => {
    const config: DeltaConfig = {
      at: 2020,
      from: { type: 'series', series: 'a' },
    };
    expect(typeof config.at).toBe('number');
  });

  test('`at` can be a string (categorical X axis)', () => {
    const config: DeltaConfig = {
      at: 'Q1',
      from: { type: 'series', series: 'a' },
    };
    expect(config.at).toBe('Q1');
  });

  test('has required `from` target', () => {
    const config: DeltaConfig = {
      at: 2020,
      from: { type: 'series', series: 'revenue' },
    };
    expect(config.from.type).toBe('series');
  });

  test('has optional `to` target', () => {
    const config: DeltaConfig = {
      at: 2020,
      from: { type: 'series', series: 'revenue' },
      to: { type: 'series', series: 'expenses' },
    };
    expect(config.to?.type).toBe('series');
  });

  test('without `to` target, defaults to Y=0 baseline', () => {
    const config: DeltaConfig = {
      at: 2020,
      from: { type: 'series', series: 'profit' },
      // no `to` - implicitly compares to Y axis baseline
    };
    expect(config.to).toBeUndefined();
  });
});

// ── DeltaConfig – styling ────────────────────────────────────────────────────

describe('DeltaConfig – styling with LineStrokeStyle', () => {
  test('accepts stroke style for delta visualization', () => {
    const config: DeltaConfig = {
      at: 2020,
      from: { type: 'series', series: 'a' },
      to: { type: 'series', series: 'b' },
      stroke: {
        stroke: '#dc2626',
        strokeWidth: 2,
        strokeDasharray: '4 4',
      },
    };
    expect(config.stroke?.stroke).toBe('#dc2626');
    expect(config.stroke?.strokeWidth).toBe(2);
  });

  test('stroke is optional', () => {
    const config: DeltaConfig = {
      at: 2020,
      from: { type: 'series', series: 'a' },
    };
    expect(config.stroke).toBeUndefined();
  });
});

// ── DeltaConfig – formatting ─────────────────────────────────────────────────

describe('DeltaConfig – difference formatting', () => {
  test('accepts custom formatDiff function', () => {
    const config: DeltaConfig = {
      at: 2020,
      from: { type: 'series', series: 'a' },
      formatDiff: (diff) => `${(diff * 100).toFixed(2)}%`,
    };
    expect(config.formatDiff?.(0.25)).toBe('25.00%');
  });

  test('formatDiff is optional', () => {
    const config: DeltaConfig = {
      at: 2020,
      from: { type: 'series', series: 'a' },
    };
    expect(config.formatDiff).toBeUndefined();
  });
});

// ── DeltaConfig – positioning ────────────────────────────────────────────────

describe('DeltaConfig – text positioning', () => {
  test('accepts dx offset for text', () => {
    const config: DeltaConfig = {
      at: 2020,
      from: { type: 'series', series: 'a' },
      dx: 10,
    };
    expect(config.dx).toBe(10);
  });

  test('accepts dy offset for text', () => {
    const config: DeltaConfig = {
      at: 2020,
      from: { type: 'series', series: 'a' },
      dy: -15,
    };
    expect(config.dy).toBe(-15);
  });

  test('accepts lineAnchor for text position relative to delta line', () => {
    const anchors = ['top', 'middle', 'bottom'] as const;
    for (const anchor of anchors) {
      const config: DeltaConfig = {
        at: 2020,
        from: { type: 'series', series: 'a' },
        lineAnchor: anchor,
      };
      expect(config.lineAnchor).toBe(anchor);
    }
  });

  test('text positioning is optional', () => {
    const config: DeltaConfig = {
      at: 2020,
      from: { type: 'series', series: 'a' },
    };
    expect(config.dx).toBeUndefined();
    expect(config.dy).toBeUndefined();
    expect(config.lineAnchor).toBeUndefined();
  });
});

// ── DeltaConfig – realistic scenarios ─────────────────────────────────────────

describe('DeltaConfig – realistic use cases', () => {
  test('difference between two series', () => {
    const config: DeltaConfig = {
      at: 2020,
      from: { type: 'series', series: 'revenue' },
      to: { type: 'series', series: 'expenses' },
      stroke: {
        stroke: '#dc2626',
        strokeDasharray: '6 6',
      },
      formatDiff: (diff) => `$${Math.abs(diff).toFixed(2)}K`,
      dx: 15,
      dy: -10,
      lineAnchor: 'middle',
    };
    expect(config.from.type).toBe('series');
    expect(config.to?.type).toBe('series');
    expect(config.formatDiff?.(50.5)).toBe('$50.50K');
  });

  test('difference from Y=0 baseline (no `to` target)', () => {
    const config: DeltaConfig = {
      at: 2020,
      from: { type: 'series', series: 'profit' },
      stroke: { stroke: '#16a34a', strokeWidth: 3 },
      formatDiff: (diff) => diff.toFixed(1),
    };
    expect(config.to).toBeUndefined();
    // Implicitly compares to Y=0
    expect(config.formatDiff?.(15.7)).toBe('15.7');
  });

  test('difference with custom baseline value', () => {
    const config: DeltaConfig = {
      at: 'Q2',
      from: { type: 'series', series: 'target' },
      to: { type: 'axis', axis: 'y', value: 100 },
      formatDiff: (diff) => `${Math.abs(diff).toFixed(0)} units`,
    };
    expect(config.to?.type).toBe('axis');
    expect(config.to?.value).toBe(100);
  });

  test('minimal config (required fields only)', () => {
    const config: DeltaConfig = {
      at: 2025,
      from: { type: 'series', series: 'metric' },
    };
    expect(config.at).toBe(2025);
    expect(config.from.type).toBe('series');
    // Everything else is optional and can be filled by defaults
  });
});
