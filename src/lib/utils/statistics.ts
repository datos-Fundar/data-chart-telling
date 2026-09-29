import { windowY } from 'svelteplot';
import type { AxisValue } from '$lib/types/layout/scales';
import type { Series } from '$lib/types/plots/data/common';
import type { StatisticConfig, MovingAverageStatisticOptions } from '$lib/types/layout/statistics';
import type { AxisBasedMarkersConfig, LineMarkerConfig } from '$lib/types/markers/common';

/**
 * Resolved `{data, x, y}` input a statistic computes over — a marker's own
 * data, or one plot series/the pooled combination of every series. `x`/`y`
 * use the same field-key-or-function shape every marker config's own `x`/`y`
 * does (not `Series`'s broader `Accessor<T,V> = keyof T | function`, which
 * also admits a numeric/symbol key — narrowed here since that's what a
 * derived marker's own `x`/`y` field actually accepts).
 */
type StatisticSource<T extends Record<string, unknown> = Record<string, unknown>> = {
	data: T[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	x: string | ((d: any) => AxisValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	y: string | ((d: any) => AxisValue);
	/** Fallback stroke for the derived marker, used when its own `styles.stroke` is unset — typically the source series' own color. */
	color?: string;
};

/** Narrows a `Series`'s own `Accessor<T,AxisValue>` (`keyof T | function`) to a `StatisticSource`'s field-key-or-function shape — safe in practice, since a real row's field key is always a string. */
function asStatisticAccessor<T extends Record<string, unknown>>(
	accessor: Series<T>['x']
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): string | ((d: any) => AxisValue) {
	return accessor as string | ((d: T) => AxisValue);
}

/**
 * Sliding-window reducer (mean/median/sum/…) via svelteplot's own `windowY`
 * transform — svelteplot has no dedicated mark for this (unlike
 * `regression`/`bollinger`), so the result is wrapped into our own `line`
 * marker. `windowY` keeps one output row per input row (unlike
 * `bollinger`/`regression`, which resample), so `x`/`y` pass straight
 * through as the same field-key-or-function shorthand `source` carries.
 */
export function resolveMovingAverage<T extends Record<string, unknown>>(
	source: StatisticSource<T>,
	config: MovingAverageStatisticOptions
): LineMarkerConfig {
	const result = windowY(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		{ data: source.data, x: source.x, y: source.y } as any,
		{ k: config.k, reduce: config.reduce ?? 'mean' }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	) as any;
	return {
		type: 'line',
		data: result.data,
		x: result.x,
		y: result.y,
		styles: { ...config.styles, stroke: config.styles?.stroke ?? source.color }
	};
}

/**
 * Resolves one {@link StatisticConfig} against a data source into the marker
 * it renders as — `regression`/`bollinger` construct their marker directly
 * (svelteplot resolves the curve/band itself, at render time); `movingAverage`
 * computes via {@link resolveMovingAverage}. The same function serves both
 * plot-level (`resolvePlotStatistics`) and marker-level (`expandMarkerStatistics`)
 * attachment — neither cares which mechanism a given `type` uses underneath.
 */
export function resolveStatisticMarker<T extends Record<string, unknown>>(
	source: StatisticSource<T>,
	config: StatisticConfig
): AxisBasedMarkersConfig {
	if (config.type === 'movingAverage') return resolveMovingAverage(source, config);
	if (config.type === 'regression') {
		return {
			type: 'regression',
			data: source.data,
			x: source.x,
			y: source.y,
			regressionType: config.regressionType,
			order: config.order,
			base: config.base,
			span: config.span,
			confidence: config.confidence,
			styles: { ...config.styles, stroke: config.styles?.stroke ?? source.color }
		};
	}
	return {
		type: 'bollinger',
		data: source.data,
		x: source.x,
		y: source.y,
		n: config.n,
		k: config.k,
		styles: { ...config.styles, stroke: config.styles?.stroke ?? source.color }
	};
}

/**
 * Resolves a plot's own top-level `statistics` prop against its already-built
 * `Series<T>[]` (every kind has this before `mapping` runs — see
 * `buildSeries`) into the derived markers to append alongside the plot's own
 * default markers. `series` unset on an entry pools every series into one
 * combined source (using the first series' own `x`/`y`, same convention each
 * kind's own "mapping" phase already uses for a shared accessor); named,
 * one statistic per listed series, using that series' own data/accessors/color.
 */
export function resolvePlotStatistics<T extends Record<string, unknown>>(args: {
	series: Series<T>[];
	statistics: StatisticConfig[] | undefined;
	colorFor?: (seriesName: string) => string;
}): AxisBasedMarkersConfig[] {
	const { series, statistics, colorFor } = args;
	if (!statistics?.length || !series.length) return [];

	return statistics.flatMap((stat) => {
		if (stat.series === undefined) {
			const pooled = series.flatMap((s) => s.data);
			const source: StatisticSource<T> = {
				data: pooled,
				x: asStatisticAccessor(series[0].x),
				y: asStatisticAccessor(series[0].y)
			};
			return [resolveStatisticMarker(source, stat)];
		}
		return stat.series.flatMap((name) => {
			const match = series.find((s) => s.name === name);
			if (!match) return [];
			const source: StatisticSource<T> = {
				data: match.data,
				x: asStatisticAccessor(match.x),
				y: asStatisticAccessor(match.y),
				color: colorFor?.(name)
			};
			return [resolveStatisticMarker(source, stat)];
		});
	});
}

/**
 * Expands each marker's own `.statistics` into derived markers, spliced in
 * right after their source so a derived marker always renders on top of it.
 * `fallbackData` mirrors `GeometryLayout`'s own `marker.data ?? data` —
 * applied here too since this runs *before* `GeometryLayout` ever sees these
 * markers, on a marker that may omit its own `data` to reuse the host plot's.
 * Generic over the caller's own marker union (e.g. `LinePlot`'s own
 * `LineMarkersConfig`, which adds a `delta` kind on top of
 * {@link AxisBasedMarkersConfig}) — untouched markers pass through as
 * `TMarker`. Eligibility is structural, not a hardcoded list of `type`s: any
 * marker mixing in `CommonMarkerConfig` (the "common" family) has `.x`/`.y`
 * and an optional `.statistics`, so a `rule`/`hover`/`component` marker
 * (neither field) always falls through the guard below untouched, and a
 * future "common" marker kind is eligible with no extra bookkeeping here.
 */
export function expandMarkerStatistics<
	TMarker extends { type: string },
	T extends Record<string, unknown>
>(markers: TMarker[], fallbackData: T[]): (TMarker | AxisBasedMarkersConfig)[] {
	return markers.flatMap((marker) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const statable = marker as unknown as Extract<AxisBasedMarkersConfig, { statistics?: any }>;
		if (!statable.statistics?.length || statable.x == null || statable.y == null) return [marker];
		const source: StatisticSource = {
			data: (statable.data as Record<string, unknown>[] | undefined) ?? fallbackData,
			x: statable.x,
			y: statable.y
		};
		const derived = statable.statistics.map((stat) => resolveStatisticMarker(source, stat));
		return [marker, ...derived];
	});
}
