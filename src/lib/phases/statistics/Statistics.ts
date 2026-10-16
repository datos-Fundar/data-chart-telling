import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { MovingAverageStatistic } from '$lib/phases/statistics/methods/MovingAverageStatistic';
import { DensityStatistic } from '$lib/phases/statistics/methods/DensityStatistic';
import { Density2dStatistic } from '$lib/phases/statistics/methods/Density2dStatistic';
import { BoxStatistic } from '$lib/phases/statistics/methods/BoxStatistic';
import { RegressionStatistic } from '$lib/phases/statistics/methods/RegressionStatistic';
import { BollingerStatistic } from '$lib/phases/statistics/methods/BollingerStatistic';
import type { StatisticSource } from '$lib/types/phases/statistics/source';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { Series } from '$lib/types/plots/data/common';
import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

/**
 * The statistics a plot or a marker asks for, as the markers they draw as.
 * Each statistic type is a class of its own under `methods/`; the same
 * {@link Statistics.buildMarker} serves plot-level and marker-level attachment.
 */
export class Statistics {
	/**
	 * Builds one {@link StatisticConfig} over a data source into the marker it
	 * renders as - `regression`/`bollinger` construct their marker directly
	 * (svelteplot resolves the curve/band itself, at render time); the others
	 * compute their rows first.
	 */
	static buildMarker<T extends Record<string, unknown>>(
		source: StatisticSource<T>,
		config: StatisticConfig
	): AxisBasedMarkersConfig {
		switch (config.type) {
			case 'movingAverage':
				return MovingAverageStatistic.build(source, config);
			case 'density':
				return DensityStatistic.build(source, config);
			case 'density2d':
				return Density2dStatistic.build(source, config);
			case 'box':
				return BoxStatistic.build(source, config);
			case 'regression':
				return RegressionStatistic.build(source, config);
			case 'bollinger':
				return BollingerStatistic.build(source, config);
		}
	}

	/** Narrows a `Series`'s own `Accessor<T,AxisValue>` to a source's field-key-or-function shape - safe in practice, since a real row's field key is always a string. */
	static #accessor<T extends Record<string, unknown>>(
		accessor: Series<T>['x']
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): string | ((d: any) => AxisValue) {
		return accessor as string | ((d: T) => AxisValue);
	}

	/**
	 * Resolves a plot's own top-level `statistics` prop against its already-built
	 * `Series<T>[]` (every kind has this before `mapping` runs - see
	 * `buildSeries`) into the derived markers to append alongside the plot's own
	 * default markers. Default (`series` unset, `pooled` unset): one statistic per
	 * series, using that series' own data/accessors/color, so a plot grouped by
	 * `color` gets its statistics grouped the same way. `pooled: true`: one
	 * statistic over every series combined (using the first series' own `x`/`y`,
	 * same convention the shared "mapping" stage uses for a shared
	 * accessor). Named `series`: one statistic per listed series.
	 */
	static buildForPlot<T extends Record<string, unknown>>(args: {
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
					x: Statistics.#accessor(series[0].x),
					y: Statistics.#accessor(series[0].y),
					color: colorFor?.(series[0].name)
				};
				return [Statistics.buildMarker(source, stat)];
			}
			const names = stat.series ?? series.map((s) => s.name);
			return names.flatMap((name) => {
				const match = series.find((s) => s.name === name);
				if (!match) return [];
				const source: StatisticSource<T> = {
					data: match.data,
					x: Statistics.#accessor(match.x),
					y: Statistics.#accessor(match.y),
					color: colorFor?.(name)
				};
				return [Statistics.buildMarker(source, stat)];
			});
		});
	}

	/**
	 * Color a marker's own statistics inherit when its `color` channel is unset:
	 * its flat fill (or stroke), ignoring `none`/`transparent`. Covers both the
	 * plain `styles` keys and the dot-specific `dotFill`/`dotStroke`.
	 */
	static #markerBaseColor(marker: { styles?: object }): string | undefined {
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
	static #groupRowsByColor<T>(data: T[], color: string | ((d: T) => unknown)): T[][] {
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
	 * `fallbackData` mirrors `GeometryLayout`'s own `marker.data ?? data` -
	 * applied here too since this runs *before* `GeometryLayout` ever sees these
	 * markers, on a marker that may omit its own `data` to reuse the host plot's.
	 * Generic over the caller's own marker union (e.g. `LinePlot`'s own
	 * `AxisBasedMarkersConfig`, which adds a `delta` kind on top of
	 * {@link AxisBasedMarkersConfig}) - untouched markers pass through as
	 * `TMarker`. Eligibility is structural, not a hardcoded list of `type`s: any
	 * marker mixing in `CommonMarkerConfig` (the "common" family) has `.x`/`.y`
	 * and an optional `.statistics`, so a `rule`/`hover`/`component` marker
	 * (neither field) always falls through the guard below untouched, and a
	 * future "common" marker kind is eligible with no extra bookkeeping here.
	 */
	static expandMarkers<TMarker extends { type: string }, T extends Record<string, unknown>>(
		markers: TMarker[],
		fallbackData: T[]
	): (TMarker | AxisBasedMarkersConfig)[] {
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
			// group, in that group's own color - same as a plot's statistics per series.
			const colorFn = statable.color
				? MarkerChannels.buildFill(data, statable.color, statable.scales, getConfiguration())
				: undefined;
			const flatColor = Statistics.#markerBaseColor(statable);
			const derived = statable.statistics.flatMap((stat) => {
				if (!colorFn || !statable.color || stat.pooled) {
					return [Statistics.buildMarker({ data, ...accessors, color: flatColor }, stat)];
				}
				return Statistics.#groupRowsByColor(data, statable.color).flatMap((rows) =>
					Statistics.buildMarker({ data: rows, ...accessors, color: colorFn(rows[0]) }, stat)
				);
			});
			return [marker, ...derived];
		});
	}
}
