import { describe, test, expect } from 'vitest';
import type {
  LineStrokeStyle,
  LineDotStyle,
  SymbolType,
  LineStyle,
} from '$lib/types/plots/styles';
import type { LineSegmentStyle, LineSegment } from '$lib/types/plots/lines';

// ── LineStrokeStyle ──────────────────────────────────────────────────────────

describe('LineStrokeStyle', () => {
  test('accepts stroke color', () => {
    const style: LineStrokeStyle = { stroke: '#ff0000' };
    expect(style.stroke).toBe('#ff0000');
  });

  test('accepts strokeWidth', () => {
    const style: LineStrokeStyle = { strokeWidth: 3 };
    expect(style.strokeWidth).toBe(3);
  });

  test('accepts strokeOpacity', () => {
    const style: LineStrokeStyle = { strokeOpacity: 0.5 };
    expect(style.strokeOpacity).toBe(0.5);
  });

  test('accepts strokeDasharray as string', () => {
    const style: LineStrokeStyle = { strokeDasharray: '5 5' };
    expect(style.strokeDasharray).toBe('5 5');
  });

  test('accepts strokeDasharray as LineStyle enum', () => {
    const style: LineStrokeStyle = { strokeDasharray: 'dashed' };
    expect(style.strokeDasharray).toBe('dashed');
  });

  test('all properties are optional', () => {
    const style: LineStrokeStyle = {};
    expect(Object.keys(style)).toHaveLength(0);
  });
});

// ── LineDotStyle ─────────────────────────────────────────────────────────────

describe('LineDotStyle', () => {
  test('accepts dotRadius', () => {
    const style: LineDotStyle = { dotRadius: 5 };
    expect(style.dotRadius).toBe(5);
  });

  test('accepts dotFill color', () => {
    const style: LineDotStyle = { dotFill: '#0000ff' };
    expect(style.dotFill).toBe('#0000ff');
  });

  test('accepts dotSymbol', () => {
    const symbols: SymbolType[] = ['circle', 'square', 'triangle', 'line'];
    for (const symbol of symbols) {
      const style: LineDotStyle = { dotSymbol: symbol };
      expect(style.dotSymbol).toBe(symbol);
    }
  });

  test('accepts dotStroke color', () => {
    const style: LineDotStyle = { dotStroke: '#00ff00' };
    expect(style.dotStroke).toBe('#00ff00');
  });

  test('accepts dotStrokeWidth', () => {
    const style: LineDotStyle = { dotStrokeWidth: 2 };
    expect(style.dotStrokeWidth).toBe(2);
  });

  test('all properties are optional', () => {
    const style: LineDotStyle = {};
    expect(Object.keys(style)).toHaveLength(0);
  });
});

// ── LineSegmentStyle (nested structure) ───────────────────────────────────────

describe('LineSegmentStyle – nested stroke and dots', () => {
  test('has optional stroke object', () => {
    const style: LineSegmentStyle = {
      stroke: { stroke: '#ff0000', strokeWidth: 2 },
    };
    expect(style.stroke?.stroke).toBe('#ff0000');
    expect(style.stroke?.strokeWidth).toBe(2);
  });

  test('has optional dots object', () => {
    const style: LineSegmentStyle = {
      dots: { dotRadius: 5, dotSymbol: 'circle' },
    };
    expect(style.dots?.dotRadius).toBe(5);
    expect(style.dots?.dotSymbol).toBe('circle');
  });

  test('can have both stroke and dots', () => {
    const style: LineSegmentStyle = {
      stroke: { stroke: '#ff0000', strokeWidth: 3 },
      dots: { dotRadius: 4, dotFill: '#ff0000' },
    };
    expect(style.stroke?.stroke).toBe('#ff0000');
    expect(style.dots?.dotRadius).toBe(4);
  });

  test('can be completely empty (will use defaults)', () => {
    const style: LineSegmentStyle = {};
    expect(style.stroke).toBeUndefined();
    expect(style.dots).toBeUndefined();
  });

  test('presence of dots implies showDots=true (no explicit flag needed)', () => {
    const style: LineSegmentStyle = { dots: { dotRadius: 5 } };
    // The presence of the dots object is the indicator that dots should be shown
    expect(style.dots).toBeDefined();
  });
});

// ── LineSegment (styling only, no data) ───────────────────────────────────────

describe('LineSegment', () => {
  test('is an alias for LineSegmentStyle', () => {
    const segment: LineSegment = {
      stroke: { stroke: '#ff0000', strokeWidth: 2 },
      dots: { dotRadius: 4 },
    };
    expect(segment.stroke).toBeDefined();
    expect(segment.dots).toBeDefined();
  });

  test('does NOT contain data (styling only)', () => {
    const segment: LineSegment = { stroke: { stroke: '#ff0000' } };
    expect('data' in segment).toBe(false);
  });
});

// ── LineStyle enum ───────────────────────────────────────────────────────────

describe('LineStyle enum', () => {
  test('supports solid style', () => {
    const style: LineStyle = 'solid';
    expect(style).toBe('solid');
  });

  test('supports dashed style', () => {
    const style: LineStyle = 'dashed';
    expect(style).toBe('dashed');
  });

  test('supports dotted style', () => {
    const style: LineStyle = 'dotted';
    expect(style).toBe('dotted');
  });

  test('supports dashdot style', () => {
    const style: LineStyle = 'dashdot';
    expect(style).toBe('dashdot');
  });
});

// ── SymbolType enum ──────────────────────────────────────────────────────────

describe('SymbolType enum', () => {
  test('supports circle symbol', () => {
    const symbol: SymbolType = 'circle';
    expect(symbol).toBe('circle');
  });

  test('supports square symbol', () => {
    const symbol: SymbolType = 'square';
    expect(symbol).toBe('square');
  });

  test('supports triangle symbol', () => {
    const symbol: SymbolType = 'triangle';
    expect(symbol).toBe('triangle');
  });

  test('supports line symbol', () => {
    const symbol: SymbolType = 'line';
    expect(symbol).toBe('line');
  });
});

// ── Complex nesting scenarios ────────────────────────────────────────────────

describe('Complex styling scenarios', () => {
  test('stroke with all properties and different dot colors', () => {
    const style: LineSegmentStyle = {
      stroke: {
        stroke: '#4f46e5',
        strokeWidth: 3,
        strokeOpacity: 0.8,
        strokeDasharray: '5 5',
      },
      dots: {
        dotRadius: 6,
        dotFill: '#ffffff',
        dotStroke: '#4f46e5',
        dotStrokeWidth: 2,
        dotSymbol: 'circle',
      },
    };

    expect(style.stroke?.stroke).toBe('#4f46e5');
    expect(style.stroke?.strokeWidth).toBe(3);
    expect(style.stroke?.strokeOpacity).toBe(0.8);
    expect(style.stroke?.strokeDasharray).toBe('5 5');

    expect(style.dots?.dotRadius).toBe(6);
    expect(style.dots?.dotFill).toBe('#ffffff');
    expect(style.dots?.dotStroke).toBe('#4f46e5');
    expect(style.dots?.dotSymbol).toBe('circle');
  });

  test('stroke with LineStyle enum and triangle dots', () => {
    const style: LineSegmentStyle = {
      stroke: {
        stroke: '#e6580d',
        strokeDasharray: 'dashed',
      },
      dots: {
        dotSymbol: 'triangle',
        dotRadius: 5,
      },
    };

    expect(style.stroke?.strokeDasharray).toBe('dashed');
    expect(style.dots?.dotSymbol).toBe('triangle');
  });

  test('only dots, no stroke styling', () => {
    const style: LineSegmentStyle = {
      dots: { dotRadius: 4, dotSymbol: 'square' },
    };

    expect(style.stroke).toBeUndefined();
    expect(style.dots?.dotSymbol).toBe('square');
  });

  test('only stroke, no dots (dots will not render)', () => {
    const style: LineSegmentStyle = {
      stroke: {
        stroke: '#4f46e5',
        strokeWidth: 2,
      },
    };

    expect(style.stroke?.stroke).toBe('#4f46e5');
    expect(style.dots).toBeUndefined();
  });
});
