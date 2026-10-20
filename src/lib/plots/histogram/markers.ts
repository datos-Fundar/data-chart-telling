import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { Transforms } from '$lib/phases/transforms/Transforms';
import { resolveAccessor } from '$lib/plots/utils/accessors';
import { PlotAxes } from '$lib/phases/data/PlotAxes';

import type { HistogramPlotState, HistogramPlotCtx } from '$lib/types/plots/histogram/state';
import type { AxisBasedMarkersConfig, TextMarkerConfig } from '$lib/types/markers/common';
import type { ProcessedRow } from '$lib/types/phases';
import type { ValueLabels } from '$lib/layout/styles/ValueLabels';

/**
 * HistogramPlot's `styles.values` as one `'text'` marker over its non-empty
 * bins (a `filter` on the count), each labelled with its count by `format`.
 * `anchor` places each label along its bar: past its top (`'outside'`), just
 * inside it (`'start'`), at its base (`'end'`), or centred (`'middle'`) -
 * upward, or rightward on a horizontal histogram.
 */
export function buildValueLabels<TData extends Record<string, unknown>>(
	labels: ValueLabels,
	state: HistogramPlotState<TData>,
	ctx: HistogramPlotCtx
): TextMarkerConfig[] {
	const { processedData: processed } = state;
	if (!processed?.data.length) return [];
	const { font, anchor, format } = labels;
	const nameOf = (d: ProcessedRow) => String(d[SERIES_KEY]);
	const value = PlotAxes.valueOf(state);
	const binned = PlotAxes.other(value);
	const horizontal = value === 'x';
	const position = ProcessedPositions.of(processed, value);
	const read = (channel: unknown) =>
		channel === undefined
			? undefined
			: (resolveAccessor(channel as never) as (d: ProcessedRow) => unknown);
	const topOf = (d: ProcessedRow) => Number(position[value](d));
	const bottomOf = read(processed.channels[`${value}1`]) ?? (() => 0);
	const countRead = read(processed.channels[value]);
	const countOf = (d: ProcessedRow) =>
		countRead ? Number(countRead(d)) : topOf(d) - Number(bottomOf(d));

	const along =
		anchor === 'end'
			? bottomOf
			: anchor === 'middle'
				? (d: ProcessedRow) => (topOf(d) + Number(bottomOf(d))) / 2
				: topOf;
	// Outward from the bar's top: past it, just inside it, or out from its base.
	const outward = anchor === 'outside' ? 6 : anchor === 'start' ? -4 : anchor === 'end' ? 4 : 0;
	const outwardAnchor = anchor === 'start' ? 'end' : anchor === 'middle' ? 'middle' : 'start';

	const marker = Transforms.resolve<TextMarkerConfig>(
		{
			type: 'text',
			data: processed.data,
			[binned]: position[binned] as TextMarkerConfig['x'],
			[value]: along as TextMarkerConfig['y'],
			transforms: [{ type: 'filter', filter: (d: ProcessedRow) => countOf(d) > 0 }],
			text: (d: ProcessedRow) => format(countOf(d), nameOf(d)),
			styles: {
				...font,
				fill: font?.fill ?? ctx.cfg.axis.color,
				fontSize: font?.fontSize ?? 12,
				dx: font?.dx ?? (horizontal ? outward : 0),
				dy: font?.dy ?? (horizontal ? 0 : -outward),
				textAnchor: labels.textAnchor ?? (horizontal ? outwardAnchor : 'middle'),
				lineAnchor:
					font?.lineAnchor ??
					(horizontal
						? 'middle'
						: anchor === 'start'
							? 'top'
							: anchor === 'middle'
								? 'middle'
								: 'bottom')
			}
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
export function buildMarks<TData extends Record<string, unknown>>(
	state: HistogramPlotState<TData>,
	ctx: HistogramPlotCtx
): AxisBasedMarkersConfig[] {
	const { channels, options, transforms } = state.processedData!;
	const fillOpacity = ctx.cfg.histogram.fillOpacity;

	const rects = (state.processedGroups ?? []).flatMap((group) => {
		const disabled = ctx.interaction?.fillFor(group.series.name);
		return group.visualSegments.map((seg) =>
			Transforms.finish(
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

	return rects;
}
