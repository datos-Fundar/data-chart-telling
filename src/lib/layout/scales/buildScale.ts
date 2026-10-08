import { SvelteSet } from 'svelte/reactivity';
import type { AxisScale } from '$lib/types/layout/scales';
import type { AxisValue } from '$lib/types/layout/mapping';

/** One representative row per unique axis value (first occurrence in `rows`). */
function uniqueRows<TData>(rows: TData[], getAxisValue: (d: TData) => AxisValue): TData[] {
	const seen = new SvelteSet<AxisValue>();
	const out: TData[] = [];
	for (const row of rows) {
		const v = getAxisValue(row);
		if (seen.has(v)) continue;
		seen.add(v);
		out.push(row);
	}
	return out;
}

/** svelteplot's `sort` option only does a fixed ascending sort; a custom `scale.sort` comparator is resolved into an explicit `domain` instead, which svelteplot honors as-is. */
function sortedScale<TData>(
	scale: AxisScale<TData> | undefined,
	rows: TData[],
	getAxisValue: (d: TData) => AxisValue
): AxisScale<TData> | undefined {
	const sort = scale?.sort;
	if (!sort || scale?.domain) return scale;
	const reps = uniqueRows(rows, getAxisValue);
	if (reps.length === 0 || !reps.every((r) => typeof getAxisValue(r) === 'string')) return scale;
	const domain = [...reps].sort(sort).map(getAxisValue);
	return { ...scale, domain };
}

/** Scale types {@link buildScale}'s default `nice` only applies to - every other type has its own tick semantics (or isn't numeric at all). */
const CONTINUOUS_NUMERIC_TYPES = new Set(['auto', 'linear', 'pow', 'sqrt', 'log', 'symlog']);

/** Whether the axis' values are numeric; `nice` on a categorical axis would make svelteplot treat it as linear. */
function isNumericAxis<TData>(rows: TData[], getAxisValue: (d: TData) => AxisValue): boolean {
	let numericSeen = 0;
	for (const row of rows) {
		const v = getAxisValue(row);
		if (v == null) continue;
		if (typeof v !== 'number') return false;
		if (++numericSeen >= 2) return true;
	}
	return numericSeen > 0;
}

/**
 * An {@link AxisScale} as svelteplot's `<Plot x>`/`<Plot y>` accepts it: without
 * `grid`, `axisDisplay` and a vertical `label`, which `ScalesLayout` draws, and
 * with `nice: true` on an unpinned numeric axis.
 */
export function buildScale<TData>(
	scale: AxisScale<TData> | undefined,
	rows: TData[],
	getAxisValue: (d: TData) => AxisValue
): AxisScale<TData> | undefined {
	const sorted = sortedScale(scale, rows, getAxisValue);
	const wantsNice =
		scale?.domain == null &&
		scale?.ticks == null &&
		scale?.nice == null &&
		(scale?.type == null || CONTINUOUS_NUMERIC_TYPES.has(scale.type)) &&
		isNumericAxis(rows, getAxisValue);
	const removesAxis = scale?.axisDisplay === 'none';
	if (!sorted && !wantsNice && !removesAxis) return sorted;
	const out: AxisScale<TData> & { axis?: false } = { ...sorted };
	delete out.grid;
	delete out.axisDisplay;
	if (removesAxis) out.axis = false;
	if (scale?.labelOrientation === 'vertical') out.label = false;
	if (wantsNice) out.nice = true;
	return out;
}
