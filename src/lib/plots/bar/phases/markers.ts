import { getConfiguration } from '$lib/configuration/config.svelte';
import { SERIES_KEY, buildProcessedGroups } from '$lib/layout/phases/transforms';
import { GAP_KIND, GAP_VALUE } from '$lib/plots/bar/phases/transforms';
import { resolveGapAreaStyle } from '$lib/plots/utils/gaps';
import { ownTextAnchor, seriesValueOf, valueLabelHooks } from '$lib/plots/utils/valueLabels';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { BarMarkerConfig, TextMarkerConfig } from '$lib/types/markers/common';
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';
import type { ProcessedRow } from '$lib/types/layout/phases';

const GAP_KINDS = ['start', 'middle', 'end'] as const;

type CategoryChannel = BarMarkerConfig['x'];
type ValueChannel = BarMarkerConfig['x2'];

/**
 * BarPlot's `styles.values` as one `'text'` marker per series, over the same
 * processed rows its bars draw (gap rows never get a label). `anchor` places
 * each label along its bar: past its top (`'outside'`), just inside it
 * (`'start'`), at its base (`'end'`), or centred (`'middle'`); a stacked bar's
 * label always sits at the middle of its own span. A grouped bar's label
 * shifts with its series' slice of the band.
 */
export function buildValueLabelMarkers<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>,
	ctx: BarPlotCtx
): TextMarkerConfig[] {
	const { values, processedData, isHorizontal } = state;
	const layout = state.barLayout!;
	if (!values?.show || !processedData) return [];
	const font = values.fontStyle;
	const anchor = values.anchor ?? 'outside';
	const format = values.format ?? ((v: number) => `${v}`);
	const nameOf = (d: ProcessedRow) => String(d[SERIES_KEY]);
	const valueOf = seriesValueOf(state);

	const top = (d: ProcessedRow) => layout.spanOf(d)?.[1] ?? 0;
	const position =
		layout.layout === 'stacked'
			? (d: ProcessedRow) => {
					const [from, to] = layout.spanOf(d) ?? [0, 0];
					return (from + to) / 2;
				}
			: anchor === 'middle' && !isHorizontal
				? (d: ProcessedRow) => top(d) / 2
				: anchor === 'end'
					? () => 0
					: top;
	// Outward from the bar's top along the value axis: up for a vertical bar, right for a horizontal one.
	const outward = anchor === 'outside' ? 6 : anchor === 'start' ? -4 : anchor === 'end' ? 4 : 0;
	const textAnchor =
		ownTextAnchor(font) ??
		(isHorizontal
			? anchor === 'outside' || anchor === 'end'
				? 'start'
				: anchor === 'start'
					? 'end'
					: 'middle'
			: 'middle');
	const lineAnchor =
		font?.lineAnchor ??
		(isHorizontal
			? 'middle'
			: anchor === 'outside' || anchor === 'end'
				? 'bottom'
				: anchor === 'start'
					? 'top'
					: 'middle');
	const hooks = valueLabelHooks(values, ctx, nameOf);

	const labelled = processedData.data.filter(
		(d) => d[GAP_VALUE] === undefined && layout.spanOf(d) !== undefined
	);
	return (state.resolvedSeries ?? []).flatMap((s): TextMarkerConfig[] => {
		const data = labelled.filter((d) => d[SERIES_KEY] === s.name);
		if (data.length === 0) return [];
		const slice = layout.groupOffset(layout.seriesIndexOf(s.name));
		return [
			{
				type: 'text',
				data,
				...(isHorizontal
					? { x: position, y: layout.categoryOf }
					: { x: layout.categoryOf, y: position }),
				text: (d: ProcessedRow) => format(Number(valueOf(d)), s.name),
				styles: {
					...font,
					fill: font?.fill ?? ctx.cfg.axis.color,
					fontSize: font?.fontSize ?? 12,
					dx: font?.dx ?? (isHorizontal ? outward : slice.dx),
					dy: font?.dy ?? (isHorizontal ? slice.dy : -outward),
					textAnchor,
					lineAnchor
				},
				...hooks
			}
		];
	});
}

/**
 * BarPlot's "markers" phase: visible `role: 'segment'` bars - real data plus
 * gap fills - drawing the rows the "transforms" phase left, prepended onto
 * whatever the "statistics" phase already put in `state.markers`, and its
 * value labels on top of everything.
 */
export function buildMarkers<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>,
	ctx: BarPlotCtx
): BarPlotState<TData> {
	const { isHorizontal, gapFillMaps, colorForSeries, barLayout, processedData } = state;
	const layout = barLayout!;
	const { channels } = processedData!;
	const gapDefaults = getConfiguration().bar.gap;

	// Forwarded raw when the transforms left a plain channel (a field key keeps
	// feeding svelteplot's axis-title inference), read through the layout otherwise.
	const category = (channels.x ?? layout.categoryOf) as CategoryChannel;
	const bottom = (row: ProcessedRow) => layout.spanOf(row)?.[0] ?? layout.valueBaseline;
	const top = (row: ProcessedRow) => layout.spanOf(row)?.[1] ?? layout.valueBaseline;
	// A gap-filled row reads its value through `channels.y`, which falls back to
	// the filled value; a real row through its own series' `y`, which stays a
	// field key whenever the plot has no transforms.
	const valueOf = (channel: unknown) =>
		(layout.layout === 'stacked' || channel === undefined ? top : channel) as ValueChannel;
	const gapValue = valueOf(channels.y);

	function makeMarker(
		data: ProcessedRow[],
		seriesIndex: number,
		value: ValueChannel,
		styles: BarSegmentStyle
	): BarMarkerConfig | null {
		if (data.length === 0) return null;
		const stacked = layout.layout === 'stacked';
		const from = (stacked ? bottom : layout.valueBaseline) as ValueChannel;
		const marker: BarMarkerConfig = {
			type: 'bar',
			role: 'segment',
			isHorizontal: isHorizontal!,
			data,
			styles,
			...(isHorizontal
				? { y: category, x1: from, x2: value }
				: { x: category, y1: from, y2: value })
		};
		if (layout.layout === 'grouped') {
			const { start, end } = layout.groupInsetFraction(seriesIndex);
			if (isHorizontal) {
				marker.insetTop = start;
				marker.insetBottom = end;
			} else {
				marker.insetLeft = start;
				marker.insetRight = end;
			}
		}
		return marker;
	}

	const isReal = (row: ProcessedRow) =>
		row[GAP_VALUE] === undefined && layout.spanOf(row) !== undefined;

	const segmentMarkers: BarMarkerConfig[] = [];
	buildProcessedGroups<BarSegmentStyle>(state, false).forEach((group) => {
		const name = group.series.name;
		const seriesIndex = layout.seriesIndexOf(name);
		const defaultColor = colorForSeries!(name);
		const disabledFill = ctx.disabledFillFor?.(name);

		for (const seg of group.visualSegments) {
			const marker = makeMarker(seg.data.filter(isReal), seriesIndex, valueOf(group.series.y), {
				fill: disabledFill?.fill ?? seg.styles.fill ?? defaultColor,
				fillOpacity: disabledFill?.fillOpacity ?? seg.styles.fillOpacity ?? 1
			});
			if (marker) segmentMarkers.push(marker);
		}

		const fills = [...(gapFillMaps!.get(name)?.values() ?? [])];
		const seriesRows = processedData!.data.filter((row) => row[SERIES_KEY] === name);
		for (const kind of GAP_KINDS) {
			const fill = fills.find((f) => f.kind === kind);
			if (!fill) continue;
			const base = resolveGapAreaStyle(fill.style, defaultColor, gapDefaults);
			const rows = seriesRows.filter(
				(row) => row[GAP_KIND] === kind && layout.spanOf(row) !== undefined
			);
			const marker = makeMarker(rows, seriesIndex, gapValue, {
				...base,
				fill: disabledFill?.fill ?? base.fill,
				fillOpacity: disabledFill?.fillOpacity ?? base.fillOpacity
			});
			if (marker) segmentMarkers.push(marker);
		}
	});

	return {
		...state,
		markers: [...segmentMarkers, ...(state.markers ?? []), ...buildValueLabelMarkers(state, ctx)]
	};
}
