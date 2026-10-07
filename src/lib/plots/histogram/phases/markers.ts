import { SERIES_KEY, buildProcessedGroups, processedPosition } from '$lib/layout/phases/transforms';
import { finishTransforms, resolveTransforms } from '$lib/utils/transforms';
import { resolveAccessor } from '$lib/plots/utils/accessors';
import { ownTextAnchor, valueLabelHooks } from '$lib/plots/utils/valueLabels';
import type { HistogramPlotState, HistogramPlotCtx } from '$lib/types/plots/histogram/state';
import type { AxisBasedMarkersConfig, TextMarkerConfig } from '$lib/types/markers/common';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { ProcessedRow } from '$lib/types/layout/phases';

/**
 * HistogramPlot's `styles.values` as one `'text'` marker over its non-empty
 * bins (a `filter` on the count), each labelled with its count by `format`.
 * `anchor` places each label along its bar: above its top (`'outside'`), just
 * inside it (`'start'`), at its base (`'end'`), or centred (`'middle'`).
 */
export function buildValueLabelMarkers<TData extends Record<string, unknown>>(
	state: HistogramPlotState<TData>,
	ctx: HistogramPlotCtx
): TextMarkerConfig[] {
	const { values, processedData: processed } = state;
	if (!values?.show || !processed?.data.length) return [];
	const font = values.fontStyle;
	const anchor = values.anchor ?? 'outside';
	const format = values.format ?? ((v: number) => `${v}`);
	const nameOf = (d: ProcessedRow) => String(d[SERIES_KEY]);
	const position = processedPosition(processed);
	const read = (channel: unknown) =>
		channel === undefined
			? undefined
			: (resolveAccessor(channel as never) as (d: ProcessedRow) => unknown);
	const topOf = (d: ProcessedRow) => Number(position.y(d));
	const bottomOf = read(processed.channels.y1) ?? (() => 0);
	const countRead = read(processed.channels.y);
	const countOf = (d: ProcessedRow) =>
		countRead ? Number(countRead(d)) : topOf(d) - Number(bottomOf(d));

	const y =
		anchor === 'end'
			? bottomOf
			: anchor === 'middle'
				? (d: ProcessedRow) => (topOf(d) + Number(bottomOf(d))) / 2
				: topOf;
	// Upward from the bar's top: above it, just inside it, or up from its base.
	const outward = anchor === 'outside' ? 6 : anchor === 'start' ? -4 : anchor === 'end' ? 4 : 0;

	const marker = resolveTransforms<TextMarkerConfig>(
		{
			type: 'text',
			data: processed.data,
			x: position.x as TextMarkerConfig['x'],
			y: y as TextMarkerConfig['y'],
			transforms: [{ type: 'filter', filter: (d: ProcessedRow) => countOf(d) > 0 }],
			text: (d: ProcessedRow) => format(countOf(d), nameOf(d)),
			styles: {
				...font,
				fill: font?.fill ?? ctx.cfg.axis.color,
				fontSize: font?.fontSize ?? 12,
				dx: font?.dx ?? 0,
				dy: font?.dy ?? -outward,
				textAnchor: ownTextAnchor(font) ?? 'middle',
				lineAnchor:
					font?.lineAnchor ??
					(anchor === 'start' ? 'top' : anchor === 'middle' ? 'middle' : 'bottom')
			},
			...valueLabelHooks(values, ctx, nameOf)
		},
		processed.data
	);
	return marker.data?.length ? [marker] : [];
}

/**
 * HistogramPlot's "markers" phase: one `rect` per visual segment of each
 * series, drawing that segment's bins, dimmed with its series. The markers
 * the "statistics" phase already put in `state.markers` come after, and its
 * value labels last.
 */
export function buildMarkers<TData extends Record<string, unknown>>(
	state: HistogramPlotState<TData>,
	ctx: HistogramPlotCtx
): HistogramPlotState<TData> {
	const { channels, options, transforms } = state.processedData!;
	const fillOpacity = ctx.cfg.histogram.fillOpacity;

	// Bins are discrete, so adjacent segments share no boundary bar to bridge.
	const rects = buildProcessedGroups<AreaStyle>(state, false).flatMap((group) => {
		const disabled = ctx.disabledFillFor?.(group.series.name);
		return group.visualSegments.map((seg) =>
			finishTransforms(
				{
					type: 'rect',
					series: group.series.name,
					data: seg.data,
					...channels,
					...options,
					styles: {
						fillOpacity: disabled?.fillOpacity ?? seg.styles.fillOpacity ?? fillOpacity,
						...(seg.styles.fill !== undefined ? { fill: seg.styles.fill } : {}),
						...(disabled?.fill !== undefined ? { fill: disabled.fill } : {})
					}
				},
				transforms
			)
		);
	}) as unknown as AxisBasedMarkersConfig[];

	return {
		...state,
		markers: [...rects, ...(state.markers ?? []), ...buildValueLabelMarkers(state, ctx)]
	};
}
