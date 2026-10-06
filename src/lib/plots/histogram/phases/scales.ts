import { markerAxisValues } from '$lib/utils/markerAxisValues';
import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { HistogramPlotState } from '$lib/types/plots/histogram/state';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

type Row = Record<string | symbol, unknown>;

/** Every finite value a set of bin markers draws between two of their channels, read off each row. */
function edgeValues(markers: AxisBasedMarkersConfig[], keys: string[]): number[] {
	return markers.flatMap((m) => {
		const marker = m as unknown as { data?: Row[] } & Record<string, unknown>;
		const rows = marker.data ?? [];
		return keys.flatMap((key) => {
			const channel = marker[key];
			if (typeof channel !== 'string' && typeof channel !== 'symbol') return [];
			return rows.map((row) => Number(row[channel])).filter(Number.isFinite);
		});
	});
}

/**
 * HistogramPlot's "scales" phase. A histogram's domains come from what its
 * bins draw, not from the raw rows: an unpinned `x` covers every bin edge
 * (and the raw values), and an unpinned `y` runs from zero up to the tallest
 * bin, stacked or not. A pinned domain is left alone and clipped instead.
 */
export function buildScales<TData extends Record<string, unknown>>(
	state: HistogramPlotState<TData>
): HistogramPlotState<TData> {
	const { scales, flat = [], binMarkers = [], markers = [], x, resolvedSeries = [] } = state;
	const xAcc = resolveAccessor((x ?? resolvedSeries[0]?.x) as keyof TData);
	const next = { ...scales };

	if (!scales.x?.domain) {
		const rawX = flat.map((d) => xAcc(d));
		if (rawX.every((v) => typeof v === 'number')) {
			const values = [
				...(rawX as number[]),
				...edgeValues(binMarkers, ['x1', 'x2']),
				...markerAxisValues(markers, 'x')
			];
			if (values.length) {
				next.x = {
					...scales.x,
					domain: [Math.min(...values), Math.max(...values)],
					nice: scales.x?.nice ?? true
				};
			}
		}
	}

	if (!scales.y?.domain) {
		// A bin's own count, and where a stack puts its top and bottom edges.
		const heights = [...markerAxisValues(binMarkers, 'y'), ...edgeValues(binMarkers, ['y1', 'y2'])];
		if (heights.length) {
			next.y = {
				...scales.y,
				domain: [0, Math.max(...heights)],
				nice: scales.y?.nice ?? true
			};
		}
	}

	return { ...state, scales: next };
}
