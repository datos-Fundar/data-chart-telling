import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { isGapValue } from '$lib/plots/utils/gaps';
import type {
	ClevelandPlotState,
	ClevelandEntry,
	ClevelandLayout,
	ClevelandRole
} from '$lib/types/plots/cleveland/state';

/**
 * Where the dots of a Cleveland-style plot sit category by category: each
 * category's values - across every series that has one - and the range they
 * span, with the baseline counted as one end when the plot asks for it.
 * Built from the rows the "transforms" phase left, so a series the legend
 * omits is not in it.
 */
export class ClevelandRanges {
	readonly entries: readonly ClevelandEntry[];
	readonly layout: ClevelandLayout;

	private constructor(entries: ClevelandEntry[], layout: ClevelandLayout) {
		this.entries = entries;
		this.layout = layout;
	}

	/** The ranges of `state`'s rows; `fromBaseline` adds the plot's baseline to each category's values. */
	static of<TData extends Record<string, unknown>>(
		state: ClevelandPlotState<TData>,
		fromBaseline: boolean
	): ClevelandRanges {
		const valueAxis = PlotAxes.valueOf(state) as 'x' | 'y';
		const categoryAxis = PlotAxes.categoryOf(state) as 'x' | 'y';
		const position = ProcessedPositions.of(state.processedData!, valueAxis);
		const baseline = PlotAxes.baselineOf(state);

		const byCategory = new Map<string, ClevelandEntry>();
		const seriesOf = new Map<string, Set<string>>();
		const groups = state.processedGroups ?? [];
		for (const group of groups) {
			for (const segment of group.visualSegments) {
				for (const row of segment.data) {
					const raw = position[valueAxis](row);
					const value = Number(raw);
					if (isGapValue(raw) || !Number.isFinite(value)) continue;
					const category = position[categoryAxis](row);
					const key = String(category);
					let entry = byCategory.get(key);
					if (!entry) {
						const ends = fromBaseline ? baseline : value;
						entry = { category, dots: [], from: ends, to: ends };
						byCategory.set(key, entry);
						seriesOf.set(key, new Set());
					}
					entry.dots.push({ row, value, series: group.series.name });
					entry.from = Math.min(entry.from, value);
					entry.to = Math.max(entry.to, value);
					seriesOf.get(key)!.add(group.series.name);
				}
			}
		}
		const maxSeriesPerCategory = Math.max(0, ...[...seriesOf.values()].map((s) => s.size));
		return new ClevelandRanges([...byCategory.values()], {
			seriesCount: groups.length,
			maxSeriesPerCategory
		});
	}

	/** Where `value` sits in its category's range: the top end when it is the largest (or the only one), the bottom end when the smallest, else between. */
	static roleOf(entry: ClevelandEntry, value: number): ClevelandRole {
		if (value >= entry.to) return 'max';
		if (value <= entry.from) return 'min';
		return 'between';
	}
}
