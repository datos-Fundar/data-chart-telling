import { Transforms } from '$lib/phases/transforms/Transforms';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import type { ValueSelect } from '$lib/types/layout/styles';
import type { MarkerTransform } from '$lib/types/transforms';
import type { ProcessedRow } from '$lib/types/phases';

/** The field a row carries its place in the rows picked from, under which a transform's copy of it is traced back. */
const PLACE = '__place';

/**
 * Which rows of a plot a value label is written for: `styles.values.select`
 * (or the plot's own default) and `series`, run as `filter` and `select`
 * transforms over the processed rows. The labelled rows are the union of what
 * each selector picks, returned as the rows themselves, in their own order.
 */
export class ValueSelection {
	/** `select` as a list: none is every row. */
	static selectors(select: ValueSelect | ValueSelect[] | undefined): ValueSelect[] {
		return select === undefined ? [] : Array.isArray(select) ? select : [select];
	}

	/**
	 * The transforms that pick the rows, one list per selector: the series filter,
	 * then the `select` of that selector, with `'min'` and `'max'` read on
	 * `valueAxis`. Without selectors, one list that only filters the series.
	 */
	static transforms(
		select: ValueSelect | ValueSelect[] | undefined,
		series: string | string[] | undefined,
		valueAxis: 'x' | 'y'
	): MarkerTransform[][] {
		const names = series === undefined ? undefined : new Set([series].flat());
		const filter: MarkerTransform[] = names
			? [{ type: 'filter', filter: (d: ProcessedRow) => names.has(String(d[SERIES_KEY])) }]
			: [];
		const selectors = ValueSelection.selectors(select);
		if (selectors.length === 0) return [filter];
		return selectors.map((selector) => [
			...filter,
			{
				type: 'select',
				select: selector === 'min' || selector === 'max' ? { [valueAxis]: selector } : selector
			} as MarkerTransform
		]);
	}

	/**
	 * The rows of `rows` that any of `selections` picks, grouped by `group`
	 * (a field key or accessor) and compared on `x` and `y` - the value axis'
	 * channel is what `'min'` and `'max'` read. A transform returns copies of its
	 * rows, so each is traced back to the row it came from.
	 */
	static pick(
		rows: ProcessedRow[],
		selections: MarkerTransform[][],
		channels: {
			x: unknown;
			y: unknown;
			group: unknown;
		}
	): ProcessedRow[] {
		const placed = rows.map((row, index) => ({ ...row, [PLACE]: index }));
		const chosen = new Set<number>();
		for (const transforms of selections) {
			const picked = Transforms.resolve(
				{ data: placed, ...channels, grouping: channels.group, transforms },
				placed
			) as { data?: ProcessedRow[] };
			for (const row of picked.data ?? placed) chosen.add(row[PLACE] as number);
		}
		return rows.filter((_, index) => chosen.has(index));
	}
}
