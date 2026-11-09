import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import { Transforms } from '$lib/phases/transforms/Transforms';
import { resolveAccessor } from '$lib/utils/accessors';
import { PlotAxes } from '$lib/phases/data/PlotAxes';

import type {
	HistogramPlotState,
	HistogramPlotEnv
} from '$lib/types/plots/distribution/histogram/state';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { ProcessedRow } from '$lib/types/phases';

/**
 * HistogramPlot's "markers" phase: one `rect` per visual segment of each
 * series, drawing that segment's bins, dimmed with its series. The markers
 * the "statistics" phase already put in `state.markers` come after, and its
 * value labels last.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: HistogramPlotState<TData>,
	env: HistogramPlotEnv
): AxisBasedMarkersConfig[] {
	const { channels, options, transforms } = state.processedData!;
	const fillOpacity = env.cfg.histogram.fillOpacity;

	// Each bin writes its own count, along its bar: past its top (`'outside'`), against an edge, at its tip or its
	// base - upward, or rightward on a horizontal histogram. A bin with nothing in it writes nothing.
	const labels = state.valueLabels?.show ? state.valueLabels : undefined;
	const value = PlotAxes.valueOf(state);
	const position = ProcessedPositions.of(state.processedData!, value);
	const read = (channel: unknown) =>
		channel === undefined
			? undefined
			: (resolveAccessor(channel as never) as (d: ProcessedRow) => unknown);
	const bottomOf = read(channels[`${value}1`]) ?? (() => 0);
	const countRead = read(channels[value]);
	const countOf = (d: ProcessedRow) =>
		countRead ? Number(countRead(d)) : Number(position[value](d)) - Number(bottomOf(d));
	const labelFor = (name: string) =>
		labels?.shapeLabel(env, (d) => (countOf(d) > 0 ? labels.format(countOf(d), d, name) : ''), {
			fill: 'currentColor',
			...ValueLabels.boxAnchor(labels.anchor, { isHorizontal: value === 'x' })
		});

	const rects = (state.processedGroups ?? []).flatMap((group) => {
		const disabled = env.interaction?.fillFor(group.series.name);
		// A stroke the segment sets is not a reason to lose the series' fill, as the marker would take it for the color.
		const color = state.colorForSeries!(group.series.name);
		return group.visualSegments.map((seg) =>
			Transforms.finish(
				{
					type: 'rect',
					series: group.series.name,
					data: seg.data,
					hover: 'style',
					...(labels ? { label: labelFor(group.series.name) } : {}),
					...channels,
					...options,
					styles: {
						// An outline asked for without a color is the fill's.
						...(seg.styles.strokeWidth !== undefined
							? { stroke: disabled?.fill ?? seg.styles.fill ?? color }
							: {}),
						...seg.styles,
						fill: disabled?.fill ?? seg.styles.fill ?? color,
						fillOpacity: disabled?.fillOpacity ?? seg.styles.fillOpacity ?? fillOpacity,
						// A dimmed series fades its outline with its fill.
						...(disabled?.fillOpacity !== undefined ? { strokeOpacity: disabled.fillOpacity } : {})
					}
				},
				transforms
			)
		);
	}) as unknown as AxisBasedMarkersConfig[];

	return rects;
}
