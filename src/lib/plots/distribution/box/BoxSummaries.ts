import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { quantile } from 'd3-array';
import { SERIES_ID_KEY, SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { PANEL_KEY } from '$lib/phases/facet/FacetPanels';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { TooltipState } from '$lib/layout/tooltip/TooltipState.svelte';
import { isGapValue } from '$lib/plots/utils/gaps';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { HoverPosition, ProcessedRow } from '$lib/types/phases';
import type { BoxPlotState, BoxSummaryRow } from '$lib/types/plots/distribution/box/state';

/** The whiskers reach this many interquartile ranges past the box, as svelteplot draws them. */
const WHISKER_IQR = 1.5;

/** A summary value as a tooltip shows it: at most two decimals. */
const round = (value: number) => String(Math.round(value * 100) / 100);

/**
 * The boxes a box plot draws, one summary row per series, category and facet
 * panel - the same quartiles and whiskers svelteplot's `BoxX`/`BoxY` compute,
 * so its hover and tooltip read a box rather than every value inside it.
 */
export class BoxSummaries {
	/** One summary per box, in the order the processed rows first reach it. */
	static of<TData extends Record<string, unknown>>(state: BoxPlotState<TData>): BoxSummaryRow[] {
		const processed = state.processedData;
		if (!processed?.data.length) return [];
		const valueAxis = PlotAxes.valueOf(state);
		const categoryAxis = PlotAxes.categoryOf(state);
		const position = ProcessedPositions.of(processed, valueAxis);
		const valueOf = position[valueAxis];
		const categoryOf = position[categoryAxis];
		const categoryField = processed.channels[categoryAxis];

		const boxes = new Map<string, { first: ProcessedRow; values: number[] }>();
		for (const row of processed.data) {
			const value = valueOf(row);
			if (isGapValue(value)) continue;
			const n = Number(value);
			if (!Number.isFinite(n)) continue;
			const key = JSON.stringify([
				row[SERIES_ID_KEY],
				row[PANEL_KEY] ?? null,
				String(categoryOf(row))
			]);
			const box = boxes.get(key);
			if (box) box.values.push(n);
			else boxes.set(key, { first: row, values: [n] });
		}

		return [...boxes.values()].map(({ first, values }) => {
			const sorted = values.sort((a, b) => a - b);
			const p25 = quantile(sorted, 0.25)!;
			const median = quantile(sorted, 0.5)!;
			const p75 = quantile(sorted, 0.75)!;
			const reach = (p75 - p25) * WHISKER_IQR;
			const inside = sorted.filter((v) => v >= p25 - reach && v <= p75 + reach);
			const category = categoryOf(first) as AxisValue;
			return {
				...(typeof categoryField === 'string' ? { [categoryField]: category } : {}),
				[SERIES_KEY]: first[SERIES_KEY],
				[SERIES_ID_KEY]: first[SERIES_ID_KEY],
				...(first[PANEL_KEY] !== undefined ? { [PANEL_KEY]: first[PANEL_KEY] } : {}),
				category,
				min: inside[0] ?? p25,
				p25,
				median,
				p75,
				max: inside.at(-1) ?? p75,
				count: sorted.length,
				outliers: sorted.filter((v) => v < p25 - reach || v > p75 + reach)
			};
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
	 * How a hovered box reads by default: its series, when the plot groups its
	 * rows; its category; then its five numbers, highest first, and how many
	 * values fall past the whiskers.
	 */
	static format<TData extends Record<string, unknown>>(
		state: BoxPlotState<TData>
	): (row: BoxSummaryRow) => string {
		const grouped = state.channels?.grouping !== undefined;
		return (row) => {
			const lines = grouped ? [String(row[SERIES_KEY])] : [];
			lines.push(TooltipState.value(row.category));
			lines.push(`max: ${round(row.max)}`);
			lines.push(`p75: ${round(row.p75)}`);
			lines.push(`median: ${round(row.median)}`);
			lines.push(`p25: ${round(row.p25)}`);
			lines.push(`min: ${round(row.min)}`);
			if (row.outliers.length) lines.push(`outliers: ${row.outliers.length}`);
			return lines.join('\n');
		};
	}
}
