import { resolveAccessor } from '$lib/utils/accessors';

/** The accessors a plot reads a row's interval from. */
export type IntervalAccessors = { lower?: unknown; upper?: unknown; error?: unknown };

/**
 * The ends of a row's interval: its `lower` and `upper`, or `error` either side of
 * `value`; the value itself where it has none. Always holds the value.
 */
export function rowInterval(
	accessors: IntervalAccessors,
	row: unknown,
	value: number
): [number, number] {
	const read = (accessor: unknown) =>
		accessor === undefined ? undefined : Number(resolveAccessor(accessor as never)(row as never));
	const finite = (n: number | undefined): n is number => n !== undefined && Number.isFinite(n);
	const error = read(accessors.error);
	const lower = read(accessors.lower);
	const upper = read(accessors.upper);
	const low = finite(lower) ? lower : finite(error) ? value - error : value;
	const high = finite(upper) ? upper : finite(error) ? value + error : value;
	return [Math.min(low, value), Math.max(high, value)];
}
