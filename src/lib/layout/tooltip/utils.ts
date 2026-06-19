import type { XValue } from '$lib/types/plots/common';
import type { HoverStore, HoverPoint } from '$lib/types/layout/tooltip';

/** Value equality that also handles `Date` (compared by timestamp). */
export function eq(a: XValue | number, b: XValue | number): boolean {
  if (a instanceof Date && b instanceof Date) return +a === +b;
  return a === b;
}

/**
 * Given the shared hover state, return the local points that should be
 * highlighted. `none` is handled by the caller (it shows only the locally
 * hovered rows); here we resolve the cross-facet `x` / `y` / `xy` cases.
 */
export function matchPoints<T>(points: HoverPoint<T>[], hover: HoverStore): HoverPoint<T>[] {
  const { activeX, activeY, sync } = hover;
  if (sync === 'x') {
    return activeX == null ? [] : points.filter((p) => eq(p.x, activeX));
  }
  if (sync === 'y') {
    return activeY == null ? [] : points.filter((p) => eq(p.y, activeY));
  }
  if (sync === 'xy') {
    return activeX == null || activeY == null
      ? []
      : points.filter((p) => eq(p.x, activeX) && eq(p.y, activeY));
  }
  return [];
}

/** Whether the x crosshair rule should be drawn for a given sync mode. */
export function showsRuleX(sync: HoverStore['sync']): boolean {
  return sync === 'x' || sync === 'xy' || sync === 'none';
}

/** Whether the y crosshair rule should be drawn for a given sync mode. */
export function showsRuleY(sync: HoverStore['sync']): boolean {
  return sync === 'y' || sync === 'xy';
}
