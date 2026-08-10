import type { AxisValue } from '$lib/types/plots/axis';
import type { Marker, HoverMarkerConfig } from '$lib/types/markers/common';
import type {
  HoverStore,
  HoverStrategy,
  HoverPoint,
  TooltipProp,
  TooltipOptions,
} from '$lib/types/layout/tooltip';

/** Value equality that also handles `Date` (compared by timestamp). */
export function eq(a: AxisValue, b: AxisValue): boolean {
  if (a instanceof Date && b instanceof Date) return +a === +b;
  return a === b;
}

/**
 * Given the shared hover state, return the local points that should be
 * highlighted using the store's current strategy.
 */
export function matchByStrategy<T>(points: HoverPoint<T>[], hover: HoverStore): HoverPoint<T>[] {
  const { strategy, activeX, activeY, activeSeries } = hover;
  if (strategy === 'x') {
    return activeX == null ? [] : points.filter((p) => eq(p.x, activeX));
  }
  if (strategy === 'y') {
    return activeY == null ? [] : points.filter((p) => eq(p.y, activeY));
  }
  // 'punctual': exact XY match, respecting series identity when both sides carry it
  if (activeX == null || activeY == null) return [];
  return points.filter(
    (p) =>
      eq(p.x, activeX) &&
      eq(p.y, activeY) &&
      (activeSeries == null || p.series == null || p.series === activeSeries),
  );
}

/** Whether the strategy implies an x crosshair rule by default. */
export function impliesCrosshairX(strategy: HoverStrategy): boolean {
  return strategy === 'x' || strategy === 'punctual';
}

/** Whether the strategy implies a y crosshair rule by default. */
export function impliesCrosshairY(strategy: HoverStrategy): boolean {
  return strategy === 'y' || strategy === 'punctual';
}

/** Normalize the author-facing prop into a resolved object. */
export function resolveTooltip<TRow extends Record<string, unknown>>(
  tooltip: TooltipProp<TRow> | undefined,
  defaultStrategy: HoverStrategy,
): {
  enabled: boolean;
  strategy: HoverStrategy;
  sync: boolean;
  format?: (row: TRow) => string;
  series?: string[];
  content?: TooltipOptions<TRow>['content'];
} {
  if (!tooltip) return { enabled: false, strategy: defaultStrategy, sync: false };
  if (tooltip === true) return { enabled: true, strategy: defaultStrategy, sync: false };
  return {
    enabled: true,
    strategy: tooltip.strategy ?? defaultStrategy,
    sync: tooltip.sync ?? false,
    format: tooltip.format,
    series: tooltip.series,
    content: tooltip.content,
  };
}

/**
 * Resolve the strategy that should drive the shared hover store:
 * the tooltip's own `strategy` wins when tooltip text is enabled, else the first
 * hover marker's `strategy`, else the chart kind's default.
 */
export function resolveHoverStrategy(
  tooltipStrategy: HoverStrategy | undefined,
  markers: Marker[] | undefined,
  defaultStrategy: HoverStrategy,
): HoverStrategy {
  return tooltipStrategy ?? findHoverMarker(markers)?.strategy ?? defaultStrategy;
}

/**
 * Resolve whether the hover should be broadcast across facets:
 * the tooltip's own `sync` wins when tooltip text is enabled, else the first
 * hover marker's `sync`, else false.
 */
export function resolveHoverSync(
  tooltipSync: boolean | undefined,
  markers: Marker[] | undefined,
): boolean {
  return tooltipSync ?? findHoverMarker(markers)?.sync ?? false;
}

/** Whether any marker in the list is a hover marker. */
export function hasHoverMarker(markers: Marker[] | undefined): boolean {
  return (markers ?? []).some((m) => m.type === 'hover');
}

/** First hover marker in the list, if any. */
export function findHoverMarker(markers: Marker[] | undefined): HoverMarkerConfig | undefined {
  return (markers ?? []).find((m): m is HoverMarkerConfig => m.type === 'hover');
}

/** Narrow matched points down to a named subset of series (no-op if `series` is empty/undefined). */
export function filterBySeries<T>(points: HoverPoint<T>[], series?: string[]): HoverPoint<T>[] {
  if (!series || series.length === 0) return points;
  return points.filter((p) => p.series != null && series.includes(p.series));
}
