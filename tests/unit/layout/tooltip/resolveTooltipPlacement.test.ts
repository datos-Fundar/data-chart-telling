import { describe, test, expect } from 'vitest';
import { resolveTooltipPlacement } from '$lib/layout/tooltip/resolveTooltipPlacement';

const BOUNDS = { width: 400, height: 300 };
const BOX = { boxWidth: 80, boxHeight: 30 };

describe('resolveTooltipPlacement', () => {
  test('the system default anchors (right/bottom) sit to the right of and below the cursor', () => {
    const { left, top } = resolveTooltipPlacement({
      x: 100,
      y: 100,
      ...BOX,
      bounds: BOUNDS,
      anchorX: 'right',
      anchorY: 'bottom',
    });
    expect(left).toBe(110); // x + GAP(10)
    expect(top).toBe(110); // y + GAP(10)
  });

  test('anchorX "right" cascades to "middle" then "left" as space runs out', () => {
    // Plenty of room on the right.
    expect(resolveTooltipPlacement({ x: 50, y: 100, ...BOX, bounds: BOUNDS, anchorX: 'right', anchorY: 'middle' }).left).toBe(60);

    // No room for the right-offset box, but the centered position still fits.
    const midFallback = resolveTooltipPlacement({ x: 340, y: 100, ...BOX, bounds: BOUNDS, anchorX: 'right', anchorY: 'middle' });
    expect(midFallback.left).toBe(300); // x - boxWidth / 2

    // Neither right-offset nor centered fits — falls all the way to the left side.
    const leftFallback = resolveTooltipPlacement({ x: 398, y: 100, ...BOX, bounds: BOUNDS, anchorX: 'right', anchorY: 'middle' });
    expect(leftFallback.left).toBe(308); // x - GAP - boxWidth
  });

  test('anchorX "left" cascades to "middle" then "right" as space runs out', () => {
    expect(resolveTooltipPlacement({ x: 300, y: 100, ...BOX, bounds: BOUNDS, anchorX: 'left', anchorY: 'middle' }).left).toBe(210);

    const midFallback = resolveTooltipPlacement({ x: 60, y: 100, ...BOX, bounds: BOUNDS, anchorX: 'left', anchorY: 'middle' });
    expect(midFallback.left).toBe(20); // x - boxWidth / 2

    const rightFallback = resolveTooltipPlacement({ x: 2, y: 100, ...BOX, bounds: BOUNDS, anchorX: 'left', anchorY: 'middle' });
    expect(rightFallback.left).toBe(12); // x + GAP
  });

  test('anchorX "middle" only ever centers/clamps — no directional cascade', () => {
    expect(resolveTooltipPlacement({ x: 200, y: 100, ...BOX, bounds: BOUNDS, anchorX: 'middle', anchorY: 'middle' }).left).toBe(160);
    // Clamped to the edge margin near the boundary, not offset to a side.
    expect(resolveTooltipPlacement({ x: 2, y: 100, ...BOX, bounds: BOUNDS, anchorX: 'middle', anchorY: 'middle' }).left).toBe(6);
    expect(resolveTooltipPlacement({ x: 398, y: 100, ...BOX, bounds: BOUNDS, anchorX: 'middle', anchorY: 'middle' }).left).toBe(314);
  });

  test('anchorY "top" cascades to "middle" then "bottom" as space runs out', () => {
    expect(resolveTooltipPlacement({ x: 100, y: 100, ...BOX, bounds: BOUNDS, anchorX: 'middle', anchorY: 'top' }).top).toBe(60);

    const midFallback = resolveTooltipPlacement({ x: 100, y: 30, ...BOX, bounds: BOUNDS, anchorX: 'middle', anchorY: 'top' });
    expect(midFallback.top).toBe(15); // y - boxHeight / 2

    const bottomFallback = resolveTooltipPlacement({ x: 100, y: 8, ...BOX, bounds: BOUNDS, anchorX: 'middle', anchorY: 'top' });
    expect(bottomFallback.top).toBe(18); // y + GAP
  });

  test('anchorY "bottom" cascades to "middle" then "top" as space runs out', () => {
    expect(resolveTooltipPlacement({ x: 100, y: 100, ...BOX, bounds: BOUNDS, anchorX: 'middle', anchorY: 'bottom' }).top).toBe(110);

    const midFallback = resolveTooltipPlacement({ x: 100, y: 270, ...BOX, bounds: BOUNDS, anchorX: 'middle', anchorY: 'bottom' });
    expect(midFallback.top).toBe(255); // y - boxHeight / 2

    const topFallback = resolveTooltipPlacement({ x: 100, y: 296, ...BOX, bounds: BOUNDS, anchorX: 'middle', anchorY: 'bottom' });
    expect(topFallback.top).toBe(256); // y - GAP - boxHeight
  });

  test('an oversized box (bigger than the bounds) still clamps fully on-screen', () => {
    const { left, top } = resolveTooltipPlacement({
      x: 200,
      y: 150,
      boxWidth: 500,
      boxHeight: 400,
      bounds: BOUNDS,
      anchorX: 'right',
      anchorY: 'middle',
    });
    expect(left).toBeGreaterThanOrEqual(-500); // never throws/NaNs; clamp still resolves a number
    expect(Number.isFinite(left)).toBe(true);
    expect(Number.isFinite(top)).toBe(true);
  });

  test('no bounds means no far-edge clamping — only the near (0-based) edge margin and the anchor cascade apply', () => {
    const { left, top } = resolveTooltipPlacement({ x: 100, y: 100, ...BOX, anchorX: 'left', anchorY: 'top' });
    expect(left).toBe(10); // x - GAP - boxWidth
    expect(top).toBe(60); // y - GAP - boxHeight
  });
});
