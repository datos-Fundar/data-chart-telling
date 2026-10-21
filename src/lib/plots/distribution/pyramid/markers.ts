import { resolveAccessor } from '$lib/utils/accessors';
import { SERIES_ID_KEY } from '$lib/phases/transforms/TransformsPhase';
import { seriesIdOf } from '$lib/utils/grouping';
import { PlotAxes } from '$lib/phases/data/PlotAxes';

import { getConfiguration } from '$lib/configuration/config.svelte';
import { isGapValue, resolveGapAreaStyle } from '$lib/plots/utils/gaps';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { BarMarkerConfig, TextMarkerConfig } from '$lib/types/markers/common';
import type { ProcessedRow } from '$lib/types/phases';
import type { DiscreteGapFill } from '$lib/types/plots/gaps';
import type {
	PyramidPlotState,
	PyramidPlotCtx,
	PyramidSeries
} from '$lib/types/plots/distribution/pyramid/state';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { ValueLabels } from '$lib/layout/styles/ValueLabels';
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
 * PyramidPlot's `styles.values` as one `'text'` marker per series, over the
 * same processed rows its bars draw (gap rows never get a label), mirrored to
 * its own side of the shared zero baseline. `anchor` places each label along
 * its bar: past its end (`'outside'`/`'start'`), at the baseline (`'end'`),
 * or centred (`'middle'`). On a vertical pyramid the sides run down and up.
 */
export function buildValueLabels<TData extends Record<string, unknown>>(
	labels: ValueLabels,
	state: PyramidPlotState<TData>,
	ctx: PyramidPlotCtx
): TextMarkerConfig[] {
	const { processedData } = state;
	if (!processedData) return [];
	const { font, anchor, format } = labels;
	const categoryAxis = PlotAxes.categoryOf(state);
	const valueAxis = PlotAxes.valueOf(state);
	const isHorizontal = state.axes?.isHorizontal ?? true;

	return (state.processedGroups ?? []).flatMap(({ series }): TextMarkerConfig[] => {
		const id = seriesIdOf(series);
		const side = state.resolvedSeries!.find((s) => seriesIdOf(s) === id)!.side;
		const isLeft = side === 'left';
		const getMagnitude = resolveAccessor(series[valueAxis]!);
		const magnitude = (d: ProcessedRow) => Math.abs(Number(getMagnitude(d)));
		const signed = (d: ProcessedRow) => (isLeft ? -magnitude(d) : magnitude(d));
		const data = processedData.data.filter(
			(d) => d[SERIES_ID_KEY] === id && !isGapValue(getMagnitude(d))
		);
		if (data.length === 0) return [];
		const outward = isLeft ? -1 : 1;
		const at =
			anchor === 'middle' ? (d: ProcessedRow) => signed(d) / 2 : anchor === 'end' ? 0 : signed;
		const shift = anchor === 'middle' ? 0 : outward * (anchor === 'end' ? 4 : 6);
		// Away from the baseline: left/right on a horizontal pyramid, down/up on a vertical one.
		const awayAnchor = isHorizontal
			? anchor === 'middle'
				? 'middle'
				: isLeft
					? 'end'
					: 'start'
			: 'middle';
		const awayLine = isHorizontal
			? 'middle'
			: anchor === 'middle'
				? 'middle'
				: isLeft
					? 'top'
					: 'bottom';
		return [
			{
				type: 'text',
				data,
				[valueAxis]: at,
				[categoryAxis]: series[categoryAxis] as TextMarkerConfig['y'],
				text: (d: ProcessedRow) => format(magnitude(d), series.name),
				styles: {
					...font,
					fill: font?.fill ?? ctx.cfg.axis.color,
					fontSize: font?.fontSize ?? 12,
					dx: font?.dx ?? (isHorizontal ? shift : 0),
					dy: font?.dy ?? (isHorizontal ? 0 : -shift),
					textAnchor: labels.textAnchor ?? awayAnchor,
					lineAnchor: font?.lineAnchor ?? awayLine
				}
			} as TextMarkerConfig
		];
	});
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
	ctx: PyramidPlotCtx
): AxisBasedMarkersConfig[] {
	const { groupedSeries, gapFillMaps } = state;
	const gapDefaults = getConfiguration().pyramid.gap;
	const categoryAxis = PlotAxes.categoryOf(state);
	const valueAxis = PlotAxes.valueOf(state);
	const isHorizontal = state.axes?.isHorizontal ?? true;
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
		const disabledFill = ctx.interaction?.fillFor(group.series.name);
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
				...span(processedCategory, signed),
				styles: {
					fill: disabledFill?.fill ?? seg.styles.fill ?? defaultColor,
					fillOpacity: disabledFill?.fillOpacity ?? seg.styles.fillOpacity ?? 1
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
