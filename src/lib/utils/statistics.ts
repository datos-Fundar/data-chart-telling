import { densityX, windowY } from 'svelteplot';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { resolveChannelFill } from '$lib/markers/resolveChannelFill';
import type { AxisValue } from '$lib/types/layout/scales';
import type { Series } from '$lib/types/plots/data/common';
import type {
	StatisticConfig,
	MovingAverageStatisticOptions,
	DensityStatisticOptions
} from '$lib/types/layout/statistics';
import type {
	AreaMarkerConfig,
	AxisBasedMarkersConfig,
	LineMarkerConfig
} from '$lib/types/markers/common';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

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
 * Color a derived statistic draws in when neither its own `styles` nor its
 * source supplies one. A statistic's color is resolved in this order: its own
 * explicit style, then its source's color (the marker's own color, or the
 * plot's default series color — per group when grouped), then this.
 */
export const STATISTIC_FALLBACK_COLOR = '#000000';

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
		styles: {
			...config.styles,
			stroke: config.styles?.stroke ?? source.color ?? STATISTIC_FALLBACK_COLOR
		}
	};
}

/**
 * Silverman's rule-of-thumb bandwidth. svelteplot's own `densityX` has no
 * default bandwidth (an unset one yields NaN estimates, so nothing draws), so
 * this supplies one. Receives the sorted values, as svelteplot passes them.
 */
function silvermanBandwidth(sorted: number[]): number {
	const n = sorted.length;
	if (n < 2) return 1;
	const mean = sorted.reduce((a, b) => a + b, 0) / n;
	const sd = Math.sqrt(sorted.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
	const q = (p: number) => sorted[Math.floor(p * (n - 1))];
	const iqr = (q(0.75) - q(0.25)) / 1.34;
	const spread = Math.min(sd, iqr) || sd || 1;
	return 0.9 * spread * n ** -0.2;
}

/**
 * 1D kernel density over the source's `x` values via svelteplot's own
 * `densityX` transform, wrapped into an `area` marker — the curve's own `x`
 * is the value and `y` the density, so it draws on the plot's axes as-is.
 * Like `resolveMovingAverage`, the transform's output is one derived row per
 * estimate point rather than one per input row, so the result doesn't reuse
 * the source's own rows. Fill falls back to the source color, then to
 * {@link STATISTIC_FALLBACK_COLOR}.
 */
export function resolveDensityStatistic<T extends Record<string, unknown>>(
	source: StatisticSource<T>,
	config: DensityStatisticOptions
): AreaMarkerConfig {
	const result = densityX(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		{ data: source.data, x: source.x } as any,
		{
			channel: 'y',
			kernel: config.kernel,
			bandwidth: config.bandwidth ?? silvermanBandwidth
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	) as any;
	return {
		type: 'area',
		data: result.data,
		x: result.x,
		y: result.y,
		styles: {
			...config.styles,
			fill: config.styles?.fill ?? source.color ?? STATISTIC_FALLBACK_COLOR
		}
	};
}

/**
 * Resolves one {@link StatisticConfig} against a data source into the marker
 * it renders as — `regression`/`bollinger` construct their marker directly
 * (svelteplot resolves the curve/band itself, at render time); `movingAverage`
 * computes via {@link resolveMovingAverage}; `density` via
 * {@link resolveDensityStatistic}. The same function serves both
 * plot-level (`resolvePlotStatistics`) and marker-level (`expandMarkerStatistics`)
 * attachment — neither cares which mechanism a given `type` uses underneath.
 */
export function resolveStatisticMarker<T extends Record<string, unknown>>(
	source: StatisticSource<T>,
	config: StatisticConfig
): AxisBasedMarkersConfig {
	if (config.type === 'movingAverage') return resolveMovingAverage(source, config);
	if (config.type === 'density') return resolveDensityStatistic(source, config);
	if (config.type === 'density2d') {
		return {
			type: 'density',
			data: source.data,
			x: source.x,
			y: source.y,
			bandwidth: config.bandwidth,
			thresholds: config.thresholds,
			styles: {
				...config.styles,
				stroke: config.styles?.stroke ?? source.color ?? STATISTIC_FALLBACK_COLOR
			}
		};
	}
	if (config.type === 'box') {
		return {
			type: 'box',
			data: source.data,
			x: source.x,
			y: source.y,
			sort: config.sort,
			bar: { fill: source.color ?? STATISTIC_FALLBACK_COLOR, ...config.bar },
			rule: config.rule,
			dot: config.dot,
			tickMedian: config.tickMedian,
			tickMinMax: config.tickMinMax
		};
	}
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
			styles: {
				...config.styles,
				stroke: config.styles?.stroke ?? source.color ?? STATISTIC_FALLBACK_COLOR
			}
		};
	}
	return {
		type: 'bollinger',
		data: source.data,
		x: source.x,
		y: source.y,
		n: config.n,
		k: config.k,
		styles: {
			...config.styles,
			stroke: config.styles?.stroke ?? source.color ?? STATISTIC_FALLBACK_COLOR
		}
	};
}

/**
 * Resolves a plot's own top-level `statistics` prop against its already-built
 * `Series<T>[]` (every kind has this before `mapping` runs — see
 * `buildSeries`) into the derived markers to append alongside the plot's own
 * default markers. Default (`series` unset, `pooled` unset): one statistic per
 * series, using that series' own data/accessors/color, so a plot grouped by
 * `color` gets its statistics grouped the same way. `pooled: true`: one
 * statistic over every series combined (using the first series' own `x`/`y`,
 * same convention each kind's own "mapping" phase already uses for a shared
 * accessor). Named `series`: one statistic per listed series.
 */
export function resolvePlotStatistics<T extends Record<string, unknown>>(args: {
	series: Series<T>[];
	statistics: StatisticConfig[] | undefined;
	colorFor?: (seriesName: string) => string;
}): AxisBasedMarkersConfig[] {
	const { series, statistics, colorFor } = args;
	if (!statistics?.length || !series.length) return [];

	return statistics.flatMap((stat) => {
		if (stat.pooled && stat.series === undefined) {
			const pooled = series.flatMap((s) => s.data);
			const source: StatisticSource<T> = {
				data: pooled,
				x: asStatisticAccessor(series[0].x),
				y: asStatisticAccessor(series[0].y),
				color: colorFor?.(series[0].name)
			};
			return [resolveStatisticMarker(source, stat)];
		}
		const names = stat.series ?? series.map((s) => s.name);
		return names.flatMap((name) => {
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
 * Color a marker's own statistics inherit when its `color` channel is unset:
 * its flat fill (or stroke), ignoring `none`/`transparent`. Covers both the
 * plain `styles` keys and the dot-specific `dotFill`/`dotStroke`.
 */
function markerBaseColor(marker: { styles?: object }): string | undefined {
	const styles = marker.styles as Record<string, unknown> | undefined;
	const pick = (key: string) => {
		const value = styles?.[key];
		return typeof value === 'string' && value !== 'none' && value !== 'transparent'
			? value
			: undefined;
	};
	return pick('fill') ?? pick('dotFill') ?? pick('stroke') ?? pick('dotStroke');
}

/** Splits rows into one bucket per distinct `color` value, in first-seen order; rows without a value are skipped. */
function groupRowsByColor<T>(data: T[], color: string | ((d: T) => unknown)): T[][] {
	const valueOf =
		typeof color === 'function' ? color : (d: T) => (d as Record<string, unknown>)[color];
	const buckets = new Map<string, T[]>();
	for (const row of data) {
		const value = valueOf(row);
		if (value == null) continue;
		const key = String(value);
		const bucket = buckets.get(key);
		if (bucket) bucket.push(row);
		else buckets.set(key, [row]);
	}
	return [...buckets.values()];
}

/**
 * Expands each marker's own `.statistics` into derived markers, spliced in
 * right after their source so a derived marker always renders on top of it.
 * `fallbackData` mirrors `GeometryLayout`'s own `marker.data ?? data` —
 * applied here too since this runs *before* `GeometryLayout` ever sees these
 * markers, on a marker that may omit its own `data` to reuse the host plot's.
 * Generic over the caller's own marker union (e.g. `LinePlot`'s own
 * `AxisBasedMarkersConfig`, which adds a `delta` kind on top of
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
		const statable = marker as unknown as CommonMarkerConfigWithColor & { styles?: object };
		const { x, y } = statable;
		// A literal position (number/Date) has no per-row values to derive statistics from.
		const isAccessor = (v: unknown): v is string | ((d: unknown) => unknown) =>
			typeof v === 'string' || typeof v === 'function';
		if (!statable.statistics?.length || !isAccessor(x) || !isAccessor(y)) return [marker];
		const data = (statable.data as Record<string, unknown>[] | undefined) ?? fallbackData;
		const accessors = { x: x as StatisticSource['x'], y: y as StatisticSource['y'] };
		// A marker's `color` channel groups it: each statistic is then derived per
		// group, in that group's own color — same as a plot's statistics per series.
		const colorFn = statable.color
			? resolveChannelFill(data, statable.color, statable.scales, getConfiguration())
			: undefined;
		const flatColor = markerBaseColor(statable);
		const derived = statable.statistics.flatMap((stat) => {
			if (!colorFn || !statable.color || stat.pooled) {
				return [resolveStatisticMarker({ data, ...accessors, color: flatColor }, stat)];
			}
			return groupRowsByColor(data, statable.color).flatMap((rows) =>
				resolveStatisticMarker({ data: rows, ...accessors, color: colorFn(rows[0]) }, stat)
			);
		});
		return [marker, ...derived];
	});
}
