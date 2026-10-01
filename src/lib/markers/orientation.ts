import { DISCRETE_SCALE_TYPES, TEMPORAL_SCALE_TYPES } from '$lib/types/layout/scales';

/** Scale types that lay out discrete or ordered positions rather than a measured magnitude. */
const POSITIONAL_TYPES = new Set<string>([...DISCRETE_SCALE_TYPES, ...TEMPORAL_SCALE_TYPES]);

/**
 * Whether an orientation-sensitive marker (`box`, `area`, `regression`,
 * `bollinger`) runs horizontally on a plot with these two axis scale types:
 * true when `x` carries the measured value and `y` the categories/positions.
 * Any other pairing — including two quantitative or two categorical axes,
 * where nothing tells them apart — defaults to vertical.
 */
export function isHorizontalFor(xType: string | undefined, yType: string | undefined): boolean {
	return !POSITIONAL_TYPES.has(xType ?? '') && POSITIONAL_TYPES.has(yType ?? '');
}
