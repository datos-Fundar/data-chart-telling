import { describe, test, expect } from 'vitest';
import { resolveEdgeAwareAnchor } from '$lib/utils/edgeAwareAnchor';

const BOX = { width: 400, height: 300 };

describe('resolveEdgeAwareAnchor', () => {
  test('a point well inside the box keeps the preferred anchor and gap', () => {
    const placement = resolveEdgeAwareAnchor({
      px: 200,
      py: 150,
      ...BOX,
      textAnchor: 'start',
      lineAnchor: 'middle',
      gapX: 8,
      gapY: 0,
      extent: { width: 30, height: 12 },
    });
    expect(placement).toEqual({ textAnchor: 'start', lineAnchor: 'middle', dx: 8, dy: 0 });
  });

  test('a "start"-anchored label near the right edge flips to "end"', () => {
    const placement = resolveEdgeAwareAnchor({
      px: 390,
      py: 150,
      ...BOX,
      textAnchor: 'start',
      lineAnchor: 'middle',
      gapX: 8,
      gapY: 0,
      extent: { width: 30, height: 12 },
    });
    expect(placement.textAnchor).toBe('end');
    expect(placement.dx).toBe(-8);
  });

  test('an "end"-anchored label near the left edge flips to "start"', () => {
    const placement = resolveEdgeAwareAnchor({
      px: 10,
      py: 150,
      ...BOX,
      textAnchor: 'end',
      lineAnchor: 'middle',
      gapX: 8,
      gapY: 0,
      extent: { width: 30, height: 12 },
    });
    expect(placement.textAnchor).toBe('start');
    expect(placement.dx).toBe(8);
  });

  test('a "top"-anchored label near the bottom edge flips to "bottom"', () => {
    const placement = resolveEdgeAwareAnchor({
      px: 200,
      py: 295,
      ...BOX,
      textAnchor: 'middle',
      lineAnchor: 'top',
      gapX: 0,
      gapY: 6,
      extent: { width: 30, height: 12 },
    });
    expect(placement.lineAnchor).toBe('bottom');
    expect(placement.dy).toBe(-6);
  });

  test('a "bottom"-anchored label near the top edge flips to "top"', () => {
    const placement = resolveEdgeAwareAnchor({
      px: 200,
      py: 5,
      ...BOX,
      textAnchor: 'middle',
      lineAnchor: 'bottom',
      gapX: 0,
      gapY: 6,
      extent: { width: 30, height: 12 },
    });
    expect(placement.lineAnchor).toBe('top');
    expect(placement.dy).toBe(6);
  });

  test('a "middle"-anchored label near the right edge nudges inward instead of flipping', () => {
    const placement = resolveEdgeAwareAnchor({
      px: 395,
      py: 150,
      ...BOX,
      textAnchor: 'middle',
      lineAnchor: 'middle',
      gapX: 8,
      gapY: 0,
      extent: { width: 30, height: 12 },
    });
    expect(placement.textAnchor).toBe('middle');
    expect(placement.dx).toBeLessThan(0);
    // The nudge should be exactly enough to bring the right half-extent to the box edge.
    expect(395 + placement.dx + 15).toBeCloseTo(400);
  });

  test('a "middle"-anchored label near the left edge nudges inward instead of flipping', () => {
    const placement = resolveEdgeAwareAnchor({
      px: 5,
      py: 150,
      ...BOX,
      textAnchor: 'middle',
      lineAnchor: 'middle',
      gapX: 8,
      gapY: 0,
      extent: { width: 30, height: 12 },
    });
    expect(placement.dx).toBeGreaterThan(0);
    expect(5 + placement.dx - 15).toBeCloseTo(0);
  });
});
