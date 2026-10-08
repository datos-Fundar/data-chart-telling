import type { TooltipAnchorX, TooltipAnchorY } from '$lib/types/layout/tooltip';

const GAP = 10;
const EDGE_MARGIN = 6;

type AxisAnchor = 'before' | 'middle' | 'after';

/** Anchors tried in order for a given preference - the opposite side is always the last resort. */
function candidateOrder(anchor: AxisAnchor): AxisAnchor[] {
  if (anchor === 'before') return ['before', 'middle', 'after'];
  if (anchor === 'after') return ['after', 'middle', 'before'];
  return ['middle'];
}

function axisStart(anchor: AxisAnchor, pos: number, size: number): number {
  if (anchor === 'before') return pos - GAP - size;
  if (anchor === 'after') return pos + GAP;
  return pos - size / 2;
}

function fits(start: number, size: number, boundsSize: number): boolean {
  return start >= EDGE_MARGIN && start + size <= boundsSize - EDGE_MARGIN;
}

/** Resolves one axis: tries the preferred anchor, then its fallbacks in order, then clamps as a last resort. */
function resolveAxis(pos: number, size: number, boundsSize: number, anchor: AxisAnchor): number {
  const order = candidateOrder(anchor);
  for (const candidate of order) {
    const start = axisStart(candidate, pos, size);
    if (fits(start, size, boundsSize)) return start;
  }
  const fallbackStart = axisStart(order[order.length - 1], pos, size);
  const maxStart = Math.max(EDGE_MARGIN, boundsSize - size - EDGE_MARGIN);
  return Math.min(Math.max(fallbackStart, EDGE_MARGIN), maxStart);
}

/**
 * Resolves a floating tooltip's top-left pixel position relative to a cursor
 * point, honoring a preferred anchor per axis and falling back toward the
 * opposite side (via the centered position) when the preferred side would
 * push it past `bounds`. Used by `Tooltip.svelte` for both the default box
 * and any custom `content` snippet - both go through the same placement.
 */
export function resolveTooltipPlacement(args: {
  x: number;
  y: number;
  boxWidth: number;
  boxHeight: number;
  /** Box the tooltip must stay within - usually the hosting plot's width/height. */
  bounds?: { width: number; height: number };
  anchorX: TooltipAnchorX;
  anchorY: TooltipAnchorY;
}): { left: number; top: number } {
  const boundsWidth = args.bounds?.width ?? Infinity;
  const boundsHeight = args.bounds?.height ?? Infinity;
  const xAnchor: AxisAnchor = args.anchorX === 'right' ? 'after' : args.anchorX === 'left' ? 'before' : 'middle';
  const yAnchor: AxisAnchor = args.anchorY === 'bottom' ? 'after' : args.anchorY === 'top' ? 'before' : 'middle';
  return {
    left: resolveAxis(args.x, args.boxWidth, boundsWidth, xAnchor),
    top: resolveAxis(args.y, args.boxHeight, boundsHeight, yAnchor),
  };
}
