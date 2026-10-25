import { resolveAccessor } from '$lib/utils/accessors';

/** The accessors a plot reads a row's interval from. */
export type IntervalAccessors = { lower?: unknown; upper?: unknown; error?: unknown };

/** The numbers a plot reads off a row: a single value, or the interval around one. */
export class RowNumbers {
	/** A number of a row: a literal, or read through a field key or a function of the row; `undefined` where it is not a finite number. */
	static of(source: unknown, row: unknown): number | undefined {
		if (source === undefined) return undefined;
		const raw =
			typeof source === 'number' ? source : resolveAccessor(source as never)(row as never);
		const value = Number(raw);
		return raw === null || raw === '' || !Number.isFinite(value) ? undefined : value;
	}

	/**
	 * The ends of a row's interval: its `lower` and `upper`, or `error` either side of
	 * `value`; the value itself where it has none. Always holds the value.
	 */
	static interval(accessors: IntervalAccessors, row: unknown, value: number): [number, number] {
		const error = RowNumbers.of(accessors.error, row);
		const lower = RowNumbers.of(accessors.lower, row);
		const upper = RowNumbers.of(accessors.upper, row);
		const low = lower ?? (error === undefined ? value : value - error);
		const high = upper ?? (error === undefined ? value : value + error);
		return [Math.min(low, value), Math.max(high, value)];
	}
}
