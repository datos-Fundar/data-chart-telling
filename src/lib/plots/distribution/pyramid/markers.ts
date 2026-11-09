import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import { resolveAccessor } from '$lib/utils/accessors';
import { seriesIdOf } from '$lib/utils/grouping';
import { PlotAxes } from '$lib/phases/data/PlotAxes';

import { getConfiguration } from '$lib/configuration/config.svelte';
import { isGapValue, resolveGapAreaStyle } from '$lib/plots/utils/gaps';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { BarMarkerConfig } from '$lib/types/markers/common';
import type { DiscreteGapFill } from '$lib/types/plots/gaps';
import type {
	PyramidPlotState,
	PyramidPlotEnv,
	PyramidSeries
} from '$lib/types/plots/distribution/pyramid/state';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

const GAP_KINDS = ['start', 'middle', 'end'] as const;

/** A gap-fill row tagged with its resolved signed value as a plain field - see the note on `taggedData` below. */
type GapFillRow<TData> = TData & { __gapValue: number };

function signFor<TData extends Record<string, unknown>>(
	s: PyramidSeries<TData>,
	magnitude: number
): number {
	return s.side === 'left' ? -magnitude : magnitude;
}

/**
 * PyramidPlot's "markers" phase: one `role: 'segment'` bar per visual
 * segment, along the category axis the "data" phase read (horizontal bars for
 * categories on y, signed magnitude on x; vertical ones the other way) and with
 * no insets - prepended onto whatever the "statistics" phase already put in
 * `state.markers`. Emits no `role: 'hitArea'` markers - PyramidPlot's hover
 * matches nearest points rather than hit-testing category bands.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: PyramidPlotState<TData>,
	env: PyramidPlotEnv
): AxisBasedMarkersConfig[] {
	const { groupedSeries, gapFillMaps } = state;
	const gapDefaults = getConfiguration().pyramid.gap;
	const categoryAxis = PlotAxes.categoryOf(state);
	const valueAxis = PlotAxes.valueOf(state);
	const isHorizontal = state.axes?.isHorizontal ?? true;
	const labels = state.valueLabels?.show ? state.valueLabels : undefined;
	/**
	 * Where a series' labels sit on its bars, which run out from the shared baseline to its own side: left and right
	 * of it on a horizontal pyramid, down and up on a vertical one.
	 */
	const anchorOf = (side: 'left' | 'right') =>
		ValueLabels.boxAnchor(labels?.anchor ?? 'outside', { isHorizontal, negative: side === 'left' });
	/** One bar's own channels: its category, and its span from the baseline to its signed value. */
	const span = (category: unknown, to: unknown) =>
		({
			isHorizontal,
			[categoryAxis]: category,
			[`${valueAxis}1`]: 0,
			[`${valueAxis}2`]: to
		}) as Pick<BarMarkerConfig, 'isHorizontal' | 'x' | 'y' | 'x1' | 'x2' | 'y1' | 'y2'>;
	// The real bars draw the rows the "transforms" phase left, read through its channels.
	const processedGroups = new Map(
		(state.processedGroups ?? []).map((g) => [seriesIdOf(g.series), g])
	);

	const markers: BarMarkerConfig[] = [];
	for (const group of groupedSeries!) {
		// Forwarded raw (a field key or function, whatever the series' category is)
		// rather than pre-resolved into a closure - svelteplot's own
		// `resolve()` already handles a field-key string per row, and only a
		// literal string (not a function) lets its axis-title auto-inference
		// see the field name. `keyof TData` is always a real string key in
		// practice, just not provably so to TypeScript here.
		const category = group.series[categoryAxis] as string | ((d: TData) => AxisValue);
		const defaultColor = state.colorForSeries!(group.series.name);
		const disabledFill = env.interaction?.fillFor(group.series.name);
		const processed = processedGroups.get(seriesIdOf(group.series));
		const processedCategory = processed?.series[categoryAxis] as string | ((d: TData) => AxisValue);
		const getMagnitude = resolveAccessor(
			(processed?.series[valueAxis] ?? group.series[valueAxis]) as keyof TData
		);
		const signed = (d: TData) => signFor(group.series, Math.abs(Number(getMagnitude(d))));

		for (const seg of processed?.visualSegments ?? []) {
			const realData = (seg.data as TData[]).filter((d) => !isGapValue(getMagnitude(d)));
			if (realData.length === 0) continue;
			markers.push({
				type: 'bar',
				role: 'segment',
				data: realData,
				hover: 'style',
				...span(processedCategory, signed),
				// Each bar writes its own magnitude, on its side of the baseline.
				...(labels
					? {
							label: labels.shapeLabel(
								env,
								(d) =>
									labels.format(Math.abs(Number(getMagnitude(d as TData))), d, group.series.name),
								{ fill: 'currentColor', ...anchorOf(group.series.side) }
							)
						}
					: {}),
				styles: {
					// An outline asked for without a color is the fill's.
					...(seg.styles.strokeWidth !== undefined
						? { stroke: disabledFill?.fill ?? seg.styles.fill ?? defaultColor }
						: {}),
					...seg.styles,
					fill: disabledFill?.fill ?? seg.styles.fill ?? defaultColor,
					fillOpacity: disabledFill?.fillOpacity ?? seg.styles.fillOpacity ?? 1,
					// A dimmed series fades its outline with its fill.
					...(disabledFill?.fillOpacity !== undefined
						? { strokeOpacity: disabledFill.fillOpacity }
						: {})
				}
			});
		}

		const fillMap =
			gapFillMaps!.get(seriesIdOf(group.series)) ??
			new Map<TData, DiscreteGapFill<BarSegmentStyle>>();
		for (const kind of GAP_KINDS) {
			const filledRows = group.series.data.filter((d) => fillMap.get(d)?.kind === kind);
			if (filledRows.length === 0) continue;
			const base = resolveGapAreaStyle(
				fillMap.get(filledRows[0])!.style,
				defaultColor,
				gapDefaults
			);
			// svelteplot shallow-clones each row before invoking a mark's own
			// geometry accessors, so a `fillMap.get(d)` lookup inside `x2` would
			// see a clone, not the original key - tag the resolved value onto the
			// row as a plain field instead, which survives that clone.
			const taggedData: GapFillRow<TData>[] = filledRows.map((d) => ({
				...d,
				__gapValue: signFor(group.series, Math.abs(fillMap.get(d)!.value))
			}));
			markers.push({
				type: 'bar',
				role: 'segment',
				data: taggedData,
				...span(category, (d: TData) => (d as GapFillRow<TData>).__gapValue),
				styles: {
					...base,
					fill: disabledFill?.fill ?? base.fill,
					fillOpacity: disabledFill?.fillOpacity ?? base.fillOpacity
				}
			});
		}
	}

	return markers;
}
