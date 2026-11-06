import { resolveAccessor } from '$lib/utils/accessors';
import type { AxisValue, GroupingAccessor } from '$lib/types/layout/mapping';
import type { Series, Accessor } from '$lib/types/plots/data/common';

/**
 * A plot's `grouping`, read into its levels. A dotted name is a field of the rows when they have one by that
 * name, and the fields of its levels otherwise. Rows grouped by several levels make one key of them, dotted
 * too (`'Tertiary.Finance'`), which is how `segments` names them.
 */
export class Grouping {
	/** The separator between the levels of a grouping, and of the key they make together. */
	static readonly SEPARATOR = '.';

	/** The levels `grouping` names, outermost first: none when it is unset. */
	static levels<TRow extends Record<string, unknown>>(
		grouping: GroupingAccessor<TRow> | undefined,
		rows: readonly TRow[] = []
	): Accessor<TRow, unknown>[] {
		if (grouping === undefined) return [];
		if (typeof grouping !== 'string' || !grouping.includes(Grouping.SEPARATOR)) return [grouping];
		if (rows.some((row) => grouping in row)) return [grouping];
		return grouping.split(Grouping.SEPARATOR) as (keyof TRow & string)[];
	}

	/**
	 * The key rows split into series by: a single level as it is - a field stays its name - and several as
	 * the key their values make together. `nested` takes the outermost level alone, for a plot that draws
	 * the inner ones itself (a treemap).
	 */
	static key<TRow extends Record<string, unknown>>(
		grouping: GroupingAccessor<TRow> | undefined,
		rows: readonly TRow[] = [],
		nested = false
	): Accessor<TRow, unknown> | undefined {
		const levels = Grouping.levels(grouping, rows);
		if (levels.length <= 1 || nested) return levels[0];
		const reads = levels.map((level) => resolveAccessor<TRow>(level));
		return (row: TRow) => reads.map((read) => String(read(row))).join(Grouping.SEPARATOR);
	}
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
