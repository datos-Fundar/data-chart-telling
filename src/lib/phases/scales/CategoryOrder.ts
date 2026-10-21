import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { rowInterval, type IntervalAccessors } from '$lib/plots/utils/rowInterval';
import { isGapValue } from '$lib/plots/utils/gaps';
import type { AxisChannelName } from '$lib/types/layout/mapping';
import type { CategorySort } from '$lib/types/layout/scales';
import type { ProcessedData } from '$lib/types/phases';

/**
 * The order of a plot's categories under a declarative `scales.*.sort`: read off
 * the processed rows, by what each category holds on the value axis - its value
 * in a series, the sum of its values, or the spread between its lowest and its
 * highest.
 */
export class CategoryOrder {
	/** Whether a `sort` is a {@link CategorySort} rather than a comparator. */
	static isDeclarative(sort: unknown): sort is CategorySort {
		return typeof sort === 'object' && sort !== null && 'by' in sort;
	}

	/**
	 * The categories of `axis`, in the order `sort` gives them; `undefined` without rows to
	 * read. The state is whatever has the processed rows and the axes.
	 */
	static of(
		sort: CategorySort,
		state: { processedData?: ProcessedData; axes?: PlotAxes } & IntervalAccessors,
		axis: AxisChannelName
	): unknown[] | undefined {
		const processed = state.processedData;
		if (!processed) return undefined;
		const valueAxis = PlotAxes.valueOf(state) as 'x' | 'y';
		const position = ProcessedPositions.of(processed, valueAxis);
		const categoryOf = position[axis as 'x' | 'y'];
		const valueOf = position[valueAxis];

		// Each category, in the order the rows give them, with the values it holds.
		const held = new Map<
			string,
			{ category: unknown; series: string; values: number[]; own: number[] }
		>();
		for (const row of processed.data) {
			const category = categoryOf(row);
			const key = String(category);
			let entry = held.get(key);
			if (!entry)
				held.set(key, (entry = { category, series: String(row[SERIES_KEY]), values: [], own: [] }));
			const raw = valueOf(row);
			const value = Number(raw);
			if (isGapValue(raw) || !Number.isFinite(value)) continue;
			entry.values.push(...rowInterval(state, row, value));
			if (sort.series === undefined || String(row[SERIES_KEY]) === sort.series) {
				entry.own.push(value);
			}
		}

		const keyOf = (entry: { values: number[]; own: number[] }): number | undefined => {
			if (sort.by === 'range') {
				return entry.values.length === 0
					? undefined
					: Math.max(...entry.values) - Math.min(...entry.values);
			}
			return entry.own.length === 0 ? undefined : entry.own.reduce((sum, v) => sum + v, 0);
		};
		const sign = sort.order === 'descending' ? -1 : 1;
		const sorted = (entries: typeof held extends Map<string, infer E> ? E[] : never) =>
			entries
				.map((entry, index) => ({ entry, index, key: keyOf(entry) }))
				.sort((a, b) => {
					if (a.key === undefined || b.key === undefined) {
						return (
							(a.key === undefined ? 1 : 0) - (b.key === undefined ? 1 : 0) || a.index - b.index
						);
					}
					return sign * (a.key - b.key) || a.index - b.index;
				})
				.map(({ entry }) => entry);
		const entries = [...held.values()];
		if (!sort.grouped) return sorted(entries).map((entry) => entry.category);
		const bySeries = new Map<string, typeof entries>();
		for (const entry of entries) {
			bySeries.set(entry.series, [...(bySeries.get(entry.series) ?? []), entry]);
		}
		return [...bySeries.values()].flatMap((group) => sorted(group).map((entry) => entry.category));
	}
}
