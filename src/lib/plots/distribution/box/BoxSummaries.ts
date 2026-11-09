import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { quantile } from 'd3-array';
import { SERIES_ID_KEY, SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { PANEL_KEY } from '$lib/phases/facet/FacetPanels';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { TooltipState } from '$lib/layout/tooltip/TooltipState.svelte';
import { RowContext } from '$lib/phases/context/RowContext';
import { isGapValue } from '$lib/plots/utils/gaps';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { HoverPosition, ProcessedRow } from '$lib/types/phases';
import type { BoxPlotState, BoxSummaryRow } from '$lib/types/plots/distribution/box/state';
import type { BoxRowContext, BoxSummary } from '$lib/types/plots/distribution/box/props';

/** The whiskers reach this many interquartile ranges past the box, as svelteplot draws them. */
const WHISKER_IQR = 1.5;

/** A summary value as a tooltip shows it: at most two decimals. */
const round = (value: number) => String(Math.round(value * 100) / 100);

/**
 * The boxes a box plot draws, one per series, category and facet panel - the same quartiles and whiskers
 * svelteplot's `BoxX`/`BoxY` compute, worked out once as each value's context ({@link context}), so its hover and
 * tooltip read a box rather than every value inside it ({@link of}).
 */
export class BoxSummaries {
	/** Which box a processed row is in: its series, panel and category. */
	static #keyOf<TData extends Record<string, unknown>>(
		state: BoxPlotState<TData>
	): (row: ProcessedRow) => string {
		const categoryAxis = PlotAxes.categoryOf(state);
		const categoryOf = ProcessedPositions.of(state.processedData!, PlotAxes.valueOf(state))[
			categoryAxis
		];
		return (row) =>
			JSON.stringify([row[SERIES_ID_KEY], row[PANEL_KEY] ?? null, String(categoryOf(row))]);
	}

	/**
	 * Each value's context: the summary of the box it is in - its category, quartiles, whisker ends (the farthest
	 * values within 1.5 IQR of the box), how many values it has and the ones past the whiskers.
	 */
	static context<TData extends Record<string, unknown>>(
		state: BoxPlotState<TData>
	): (row: ProcessedRow) => BoxSummary | undefined {
		const processed = state.processedData;
		if (!processed?.data.length) return () => undefined;
		const valueAxis = PlotAxes.valueOf(state);
		const position = ProcessedPositions.of(processed, valueAxis);
		const valueOf = position[valueAxis];
		const categoryOf = position[PlotAxes.categoryOf(state)];
		const keyOf = BoxSummaries.#keyOf(state);

		const boxes = new Map<string, { category: AxisValue; values: number[] }>();
		for (const row of processed.data) {
			const value = valueOf(row);
			if (isGapValue(value)) continue;
			const n = Number(value);
			if (!Number.isFinite(n)) continue;
			const key = keyOf(row);
			const box = boxes.get(key);
			if (box) box.values.push(n);
			else boxes.set(key, { category: categoryOf(row) as AxisValue, values: [n] });
		}

		const summaries = new Map(
			[...boxes].map(([key, { category, values }]) => [
				key,
				BoxSummaries.#summarize(category, values)
			])
		);
		return (row) => summaries.get(keyOf(row));
	}

	static #summarize(category: AxisValue, values: number[]): BoxSummary {
		const sorted = values.sort((a, b) => a - b);
		const p25 = quantile(sorted, 0.25)!;
		const median = quantile(sorted, 0.5)!;
		const p75 = quantile(sorted, 0.75)!;
		const reach = (p75 - p25) * WHISKER_IQR;
		const inside = sorted.filter((v) => v >= p25 - reach && v <= p75 + reach);
		return {
			category,
			min: inside[0] ?? p25,
			p25,
			median,
			p75,
			max: inside.at(-1) ?? p75,
			count: sorted.length,
			outliers: sorted.filter((v) => v < p25 - reach || v > p75 + reach)
		};
	}

	/**
	 * One summary row per box, in the order the processed rows first reach it, read off its first value's context.
	 * Its own context is the box's, with the median for its value, and where it sits for `x` and `y`.
	 */
	static of<TData extends Record<string, unknown>>(state: BoxPlotState<TData>): BoxSummaryRow[] {
		const processed = state.processedData;
		if (!processed?.data.length) return [];
		const valueAxis = PlotAxes.valueOf(state);
		const categoryAxis = PlotAxes.categoryOf(state);
		const categoryField = processed.channels[categoryAxis];
		const keyOf = BoxSummaries.#keyOf(state);
		const firsts = new Map<string, ProcessedRow>();
		for (const row of processed.data) {
			const key = keyOf(row);
			if (!firsts.has(key) && RowContext.of<BoxRowContext>(row).median !== undefined)
				firsts.set(key, row);
		}

		return [...firsts.values()].map((first) => {
			// The box's context, not its first value's row.
			const context: BoxRowContext = { ...RowContext.of<BoxRowContext>(first), row: undefined };
			const { category, min, p25, median, p75, max, count, outliers } = context;
			const summary: BoxSummaryRow = {
				...(typeof categoryField === 'string' ? { [categoryField]: category } : {}),
				[SERIES_KEY]: first[SERIES_KEY],
				[SERIES_ID_KEY]: first[SERIES_ID_KEY],
				...(first[PANEL_KEY] !== undefined ? { [PANEL_KEY]: first[PANEL_KEY] } : {}),
				category,
				min,
				p25,
				median,
				p75,
				max,
				count,
				outliers
			};
			RowContext.tag(summary, {
				...context,
				[valueAxis]: median,
				[categoryAxis]: category,
				value: median
			});
			return summary;
		});
	}

	/** Where a box's summary sits for hover: at its category, level with its median. */
	static position<TData extends Record<string, unknown>>(
		state: BoxPlotState<TData>
	): HoverPosition {
		const valueAxis = PlotAxes.valueOf(state);
		const at = {
			[valueAxis]: (row: BoxSummaryRow) => row.median,
			[PlotAxes.other(valueAxis)]: (row: BoxSummaryRow) => row.category
		};
		return at as unknown as HoverPosition;
	}

	/**
	 * How a hovered box reads by default, from its context: its series, when the plot groups its rows; its
	 * category; then its five numbers, highest first, and how many values fall past the whiskers.
	 */
	static format<TData extends Record<string, unknown>>(
		state: BoxPlotState<TData>
	): (row: BoxSummaryRow) => string {
		const grouped = state.channels?.grouping !== undefined;
		return (row) => {
			const box = RowContext.of<BoxRowContext>(row);
			const lines = grouped ? [String(box.series)] : [];
			lines.push(TooltipState.value(box.category));
			lines.push(`max: ${round(box.max)}`);
			lines.push(`p75: ${round(box.p75)}`);
			lines.push(`median: ${round(box.median)}`);
			lines.push(`p25: ${round(box.p25)}`);
			lines.push(`min: ${round(box.min)}`);
			if (box.outliers.length) lines.push(`outliers: ${box.outliers.length}`);
			return lines.join('\n');
		};
	}
}
