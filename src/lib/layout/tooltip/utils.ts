import type { AxisValue } from '$lib/types/plots/common';
import type { Marker, HoverMarkerConfig } from '$lib/types/plots/markers';
import type {
  HoverStore,
  HoverPoint,
  TooltipProp,
  TooltipOptions,
  TooltipSync
} from '$lib/types/layout/tooltip';

/** Value equality that also handles `Date` (compared by timestamp). */
export function eq(a: AxisValue, b: AxisValue): boolean {
  if (a instanceof Date && b instanceof Date) return +a === +b;
  return a === b;
}

/**
 * Given the shared hover state, return the local points that should be
 * highlighted. `none` is handled by the caller (it shows only the locally
 * hovered rows); here we resolve the cross-facet `x` / `y` / `xy` cases.
 */
export function matchPoints<T>(points: HoverPoint<T>[], hover: HoverStore): HoverPoint<T>[] {
  const { activeX, activeY, activeSeries, sync } = hover;
  if (sync === 'x') {
    return activeX == null ? [] : points.filter((p) => eq(p.x, activeX));
  }
  if (sync === 'y') {
    return activeY == null ? [] : points.filter((p) => eq(p.y, activeY));
  }
  if (sync === 'xy') {
    // `xy` means "the same point" — when series identity is available (line/bar),
    // a coincidental (x,y) collision between two *different* series isn't the same
    // point, so it must also agree on series. Heatmaps carry no series tag at all,
    // so this is a no-op there.
    return activeX == null || activeY == null
      ? []
      : points.filter(
          (p) =>
            eq(p.x, activeX) &&
            eq(p.y, activeY) &&
            (activeSeries == null || p.series == null || p.series === activeSeries),
        );
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

/** Normalize the author-facing prop into `{ enabled, sync, format?, series?, content? }`. */
export function resolveTooltip<TRow extends Record<string, unknown>>(
  tooltip: TooltipProp<TRow> | undefined,
  defaultSync: TooltipSync,
): {
  enabled: boolean;
  sync: TooltipSync;
  format?: (row: TRow) => string;
  series?: string[];
  content?: TooltipOptions<TRow>['content'];
} {
  if (!tooltip) return { enabled: false, sync: defaultSync };
  if (tooltip === true) return { enabled: true, sync: defaultSync };
  return {
    enabled: true,
    sync: tooltip.sync ?? defaultSync,
    format: tooltip.format,
    series: tooltip.series,
    content: tooltip.content,
  };
}

/** Whether any marker in the list is a hover marker (drives Pointer/controller
 *  activation independent of whether the HTML tooltip text is shown). */
export function hasHoverMarker(markers: Marker[] | undefined): boolean {
  return (markers ?? []).some((m) => m.type === 'hover');
}

/** First hover marker in the list, if any. */
export function findHoverMarker(markers: Marker[] | undefined): HoverMarkerConfig | undefined {
  return (markers ?? []).find((m): m is HoverMarkerConfig => m.type === 'hover');
}

/**
 * Resolve the sync mode that should drive the shared hover store:
 * the tooltip's own `sync` wins when tooltip text is enabled, else the first
 * hover marker's `sync`, else the chart kind's default.
 */
export function resolveHoverSync(
  tooltipSync: TooltipSync | undefined,
  markers: Marker[] | undefined,
  defaultSync: TooltipSync,
): TooltipSync {
  return tooltipSync ?? findHoverMarker(markers)?.sync ?? defaultSync;
}

/** Narrow matched points down to a named subset of series (no-op if `series` is empty/undefined). */
export function filterBySeries<T>(points: HoverPoint<T>[], series?: string[]): HoverPoint<T>[] {
  if (!series || series.length === 0) return points;
  return points.filter((p) => p.series != null && series.includes(p.series));
}