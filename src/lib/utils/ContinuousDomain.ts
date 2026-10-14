import type { LegendRange } from '$lib/types/layout/legend';

/** The domain a continuous color ramp is drawn over. */
export class ContinuousDomain {
	/**
	 * The `[min, max]` a continuous color ramp spans: the author's numeric
	 * `domain`, or the extent of `values` - reaching zero with `fromZero`.
	 * `null` when there is neither.
	 */
	static build(
		authorDomain: readonly unknown[] | undefined,
		values: number[],
		fromZero = false
	): [number, number] | null {
		if (authorDomain && typeof authorDomain[0] === 'number') return authorDomain as [number, number];
		if (!values.length) return null;
		return [Math.min(...values, ...(fromZero ? [0] : [])), Math.max(...values)];
	}

	/** The domain a ramp is drawn over: the legend's narrowed range in `'rescale'` mode, `domain` otherwise. */
	static ramp(
		domain: [number, number],
		range: Pick<LegendRange, 'mode' | 'min' | 'max'> | null | undefined
	): [number, number] {
		return range && range.mode === 'rescale' ? [range.min, range.max] : domain;
	}
}
