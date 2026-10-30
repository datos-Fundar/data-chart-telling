import { resolveAccessor } from '$lib/utils/accessors';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisValue } from '$lib/types/layout/mapping';
import type {
	DeltaConfig,
	DeltaMarkerConfig,
	DeltaPointConfig,
	DeltaTarget,
	PerPosition
} from '$lib/types/markers/axis/delta';

/** A delta, measured: where it sits (`at`), its two ends and what lies between. */
export type ResolvedDelta = {
	cfg: DeltaConfig;
	at: number;
	from: number;
	to: number;
	diff: number;
	mid: number;
};

/**
 * A delta marker's measure: the gap, at one position along `axis`, between
 * the two curves (or axis lines) it compares. A target series is read where
 * it crosses that position, interpolated linearly between its two nearest points.
 */
export class Delta {
	/**
	 * The deltas a marker draws: one for its `at`, or one for each position of a list, each with the
	 * `line`, `text` and `dot` its style functions give for that position.
	 */
	static points(marker: DeltaMarkerConfig): DeltaPointConfig[] {
		const positions = Array.isArray(marker.at) ? marker.at : [marker.at];
		const own = <T>(style: PerPosition<T> | undefined, at: AxisValue): T | undefined =>
			typeof style === 'function' ? (style as (at: AxisValue) => T)(at) : style;
		return positions.map((at) => ({
			...marker,
			at,
			line: own(marker.line, at),
			text: own(marker.text, at),
			dot: own(marker.dot, at)
		}));
	}

	/** The delta `config` asks for over `allSeries`, or `undefined` while an end has no value there. */
	static build<T extends Record<string, unknown>>(
		axis: 'x' | 'y',
		allSeries: Series<T>[],
		config: DeltaConfig
	): ResolvedDelta | undefined {
		const at = Number(config.at);
		const from = Delta.#endpoint(axis, allSeries, config.from, at);
		const to = config.to ? Delta.#endpoint(axis, allSeries, config.to, at) : 0;
		if (from === null || to === null) return undefined;
		return {
			cfg: config,
			at,
			from,
			to,
			diff: Math.abs(from - to),
			mid: (from + to) / 2
		};
	}

	/**
	 * Where `target` stands at `at` along `axis`: its value on the other axis,
	 * or an axis line's own. For `y`, the series' first crossing of that value.
	 */
	static #endpoint<T extends Record<string, unknown>>(
		axis: 'x' | 'y',
		allSeries: Series<T>[],
		target: DeltaTarget,
		at: number
	): number | null {
		if (target.type === 'axis') return target.value ?? 0;
		const series = allSeries.find((s) => s.name === target.series);
		if (!series) return null;
		const getX = (d: T) => Number(resolveAccessor(series.x!)(d));
		const getY = (d: T) => Number(resolveAccessor(series.y!)(d));
		return axis === 'x'
			? Delta.#interpolate(series.data, getX, getX, getY, at)
			: Delta.#interpolate(series.data, getX, getY, getX, at);
	}

	/**
	 * Sorts `data` by `sortBy`, then finds the first adjacent pair where `scanBy`
	 * brackets `target` and linearly interpolates `measureBy` at that crossing.
	 */
	static #interpolate<T extends Record<string, unknown>>(
		data: T[],
		sortBy: (d: T) => number,
		scanBy: (d: T) => number,
		measureBy: (d: T) => number,
		target: number
	): number | null {
		const sorted = [...data].sort((a, b) => sortBy(a) - sortBy(b));
		for (let i = 0; i < sorted.length; i++) {
			if (scanBy(sorted[i]) === target) return measureBy(sorted[i]);
		}
		for (let i = 0; i < sorted.length - 1; i++) {
			const s0 = scanBy(sorted[i]);
			const s1 = scanBy(sorted[i + 1]);
			if ((s0 <= target && target <= s1) || (s1 <= target && target <= s0)) {
				const t = (target - s0) / (s1 - s0);
				return measureBy(sorted[i]) + t * (measureBy(sorted[i + 1]) - measureBy(sorted[i]));
			}
		}
		return null;
	}
}
