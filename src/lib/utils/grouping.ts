import { resolveAccessor } from '$lib/utils/accessors';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { Series, Accessor } from '$lib/types/plots/data/common';

/** A `grouping` as the plot takes it: one accessor, or a list of them - its levels, outermost first. */
export type GroupingProp<TRow extends Record<string, unknown>> =
	| Accessor<TRow, unknown>
	| readonly Accessor<TRow, unknown>[];

/** Whether a `grouping` is a list of levels (`Array.isArray` does not narrow a readonly one). */
const isList = <TRow extends Record<string, unknown>>(
	grouping: GroupingProp<TRow> | undefined
): grouping is readonly Accessor<TRow, unknown>[] => Array.isArray(grouping);

/** The separator between the levels of a combined grouping key. */
const LEVEL_SEPARATOR = ' · ';

/**
 * A `grouping` as the one key the plot's rows split into series by: a single accessor as it is, a list
 * of them as the key their levels make together (`'Terciarias · Resto'`). A plot that nests its levels
 * (a treemap) reads the list itself.
 */
export function groupingKey<TRow extends Record<string, unknown>>(
	grouping: GroupingProp<TRow> | undefined
): Accessor<TRow, unknown> | undefined {
	if (!isList(grouping)) return grouping;
	if (grouping.length === 0) return undefined;
	if (grouping.length === 1) return grouping[0];
	const levels = grouping.map((level) => resolveAccessor<TRow>(level));
	return (row: TRow) => levels.map((read) => String(read(row))).join(LEVEL_SEPARATOR);
}

/**
 * Splits rows into ordered groups keyed by the stringified accessor value.
 * Insertion order of first appearance is preserved, which keeps colours stable
 * across re-renders without forcing the caller to pre-sort.
 */
export function groupBy<TRow extends Record<string, unknown>>(
	data: TRow[],
	by: Accessor<TRow, unknown>
): Map<string, TRow[]> {
	const get = resolveAccessor<TRow>(by);
	const groups = new Map<string, TRow[]>();
	for (const row of data) {
		const key = String(get(row));
		const bucket = groups.get(key);
		if (bucket) bucket.push(row);
		else groups.set(key, [row]);
	}
	return groups;
}

/**
 * Adapts flat rows into the `Series[]` shape the plot expects.
 * When `grouping` is given, one series is produced per group (series `name`
 * = group value), which is exactly how the plot's `segments` map is keyed -
 * so the caller styles/colors each group by its own value (see
 * `scales.color`). A position channel the author left out stays unset on
 * every series.
 */
export function buildSeries<TRow extends Record<string, unknown>>(
	data: TRow[],
	x: Accessor<TRow, AxisValue> | undefined,
	y: Accessor<TRow, AxisValue> | undefined,
	grouping: Accessor<TRow, unknown> | undefined,
	defaultName = 'series'
): Series<TRow>[] {
	if (grouping === undefined) {
		return [{ name: defaultName, ...channels(x, y), data }];
	}
	return [...groupBy(data, grouping).entries()].map(([name, rows]) => ({
		name,
		...channels(x, y),
		data: rows
	}));
}

/** The position channels a series carries: only the ones set. */
function channels<TRow extends Record<string, unknown>>(
	x: Accessor<TRow, AxisValue> | undefined,
	y: Accessor<TRow, AxisValue> | undefined
): Pick<Series<TRow>, 'x' | 'y'> {
	return { ...(x !== undefined ? { x } : {}), ...(y !== undefined ? { y } : {}) };
}

/** A series' id: its own `id`, or its `name`. */
export function seriesIdOf(series: Pick<Series, 'name' | 'id'>): string {
	return series.id ?? series.name;
}
