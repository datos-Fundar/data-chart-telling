import type { AxisValue } from '$lib/types/layout/mapping';
import type { HoverStore, HoverStrategy, HoverPoint, TooltipProp } from '$lib/types/layout/tooltip';
import type { TooltipConfig } from '$lib/types/plots/props';

/** Value equality that also handles `Date` (compared by timestamp). */
export function eq(a: AxisValue, b: AxisValue): boolean {
	if (a instanceof Date && b instanceof Date) return +a === +b;
	return a === b;
}

/** The local points the store's current hover strategy highlights. */
export function matchByStrategy<T>(points: HoverPoint<T>[], hover: HoverStore): HoverPoint<T>[] {
	const { strategy, activeX, activeY, activeSeries } = hover;
	if (strategy === 'x') {
		return activeX == null ? [] : points.filter((p) => eq(p.x, activeX));
	}
	if (strategy === 'y') {
		return activeY == null ? [] : points.filter((p) => eq(p.y, activeY));
	}
	if (strategy === 'series') {
		return activeSeries == null ? [] : points.filter((p) => p.series === activeSeries);
	}
	// 'punctual': exact XY match, respecting series identity when both sides carry it
	if (activeX == null || activeY == null) return [];
	return points.filter(
		(p) =>
			eq(p.x, activeX) &&
			eq(p.y, activeY) &&
			(activeSeries == null || p.series == null || p.series === activeSeries)
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

/** The tooltip a plot's core draws from, or `undefined` when off. */
export function buildTooltipConfig<TRow extends Record<string, unknown>>(
	tooltip: TooltipProp<TRow> | undefined
): TooltipConfig<TRow> | undefined {
	if (!tooltip) return undefined;
	if (tooltip === true) return { sync: false };
	return { ...tooltip, sync: tooltip.sync ?? false };
}

/** The strategy driving the shared hover store: the tooltip's, else the hover marker's, else the kind's default. */
export function resolveHoverStrategy<T extends { type: string }>(
	tooltipStrategy: HoverStrategy | undefined,
	markers: T[] | undefined,
	defaultStrategy: HoverStrategy
): HoverStrategy {
	const marker = findHoverMarker(markers) as { strategy?: HoverStrategy } | undefined;
	return tooltipStrategy ?? marker?.strategy ?? defaultStrategy;
}

/** Resolve whether the hover should be broadcast across facets. Generic - see {@link resolveHoverStrategy}. */
export function resolveHoverSync<T extends { type: string }>(
	tooltipSync: boolean | undefined,
	markers: T[] | undefined
): boolean {
	const marker = findHoverMarker(markers) as { sync?: boolean } | undefined;
	return tooltipSync ?? marker?.sync ?? false;
}

/** Whether any marker in the list is a hover marker - axis-based (`'hover'`) or geo (`'geo-hover'`). */
export function hasHoverMarker(markers: { type: string }[] | undefined): boolean {
	return (markers ?? []).some((m) => m.type === 'hover' || m.type === 'geo-hover');
}

/** First hover marker in the list, if any - generic over the caller's own marker union. */
export function findHoverMarker<T extends { type: string }>(
	markers: T[] | undefined
): Extract<T, { type: 'hover' }> | undefined {
	return (markers ?? []).find((m): m is Extract<T, { type: 'hover' }> => m.type === 'hover');
}

/** Narrow matched points down to a named subset of series (no-op if `series` is empty/undefined). */
export function filterBySeries<T>(points: HoverPoint<T>[], series?: string[]): HoverPoint<T>[] {
	if (!series || series.length === 0) return points;
	return points.filter((p) => p.series != null && series.includes(p.series));
}
