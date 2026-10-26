import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { ViolinProfiles } from '$lib/markers/violin/ViolinProfiles';
import { InnerBox } from '$lib/plots/distribution/box/InnerBox';
import type { AxisPlotCtx, AxisPlotState } from '$lib/types/phases';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { ViolinPlotState, ViolinPlotCtx } from '$lib/types/plots/distribution/violin/state';
import type {
	ViolinEstimateStyles,
	ViolinPlotStylesConfig
} from '$lib/types/plots/distribution/violin/props';
import type { AxisBasedMarkersConfig, ViolinMarkerConfig } from '$lib/types/markers/common';

/**
 * One `violin` per visual segment of each series, drawing a violin per category
 * of its rows - whole, or one `side` of it - filled with its series' color (or
 * its segment's own `fill`), at `fillOpacity` unless the segment sets its own.
 * Series share each category's band side by side.
 */
export function violinMarks<TData extends Record<string, unknown>>(
	state: AxisPlotState<TData, AreaStyle>,
	ctx: AxisPlotCtx,
	{ side, fillOpacity }: { side?: ViolinMarkerConfig['side']; fillOpacity: number }
): ViolinMarkerConfig[] {
	const processed = state.processedData;
	if (!processed) return [];
	const styles = state.styles as ViolinEstimateStyles | undefined;
	const { channels } = processed;
	const groups = state.processedGroups ?? [];

	let peak: number | undefined;
	if (styles?.scale === 'shared') {
		const valueAxis = PlotAxes.valueOf(state);
		const position = ProcessedPositions.of(processed, valueAxis);
		const read = { category: position[PlotAxes.categoryOf(state)], value: position[valueAxis] };
		const estimate = { kernel: styles.kernel, bandwidth: styles.bandwidth, trim: styles.trim };
		peak = ViolinProfiles.peak(
			groups.flatMap((g) =>
				g.visualSegments.flatMap((s) => ViolinProfiles.of(s.data, read, estimate))
			)
		);
	}

	return groups.flatMap((group, index) => {
		const name = group.series.name;
		const disabled = ctx.interaction?.fillFor(name);
		return group.visualSegments.map(
			(seg): ViolinMarkerConfig => ({
				type: 'violin',
				series: name,
				data: seg.data,
				x: channels.x as ViolinMarkerConfig['x'],
				y: channels.y as ViolinMarkerConfig['y'],
				kernel: styles?.kernel,
				bandwidth: styles?.bandwidth,
				trim: styles?.trim,
				peak,
				slot: { index, count: groups.length },
				side,
				styles: {
					...seg.styles,
					fill: disabled?.fill ?? seg.styles.fill ?? state.colorForSeries!(name),
					fillOpacity: disabled?.fillOpacity ?? seg.styles.fillOpacity ?? fillOpacity
				}
			})
		);
	});
}

/**
 * ViolinPlot's "markers" phase: one `violin` - and a narrow `box` over it - per visual
 * segment of each series (see `violinMarks`). The markers the "statistics" phase
 * already put in `state.markers` come after, so they render on top.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: ViolinPlotState<TData>,
	ctx: ViolinPlotCtx
): AxisBasedMarkersConfig[] {
	if (!state.processedData) return [];
	const { cfg } = ctx;
	const styles = state.styles as ViolinPlotStylesConfig | undefined;
	const violins = violinMarks(state, ctx, { fillOpacity: cfg.violin.fillOpacity });

	// The box inside each violin, in the axis color, its median a tick, with no outliers or caps by default.
	const box = InnerBox.resolve(styles?.box, cfg.violin.boxWidth);
	const boxes = box
		? InnerBox.markers(state, box, {
				ink: cfg.axis.color,
				dimmed: (series) => ctx.interaction?.dimmed(series)
			})
		: [];

	return [...violins, ...boxes] as AxisBasedMarkersConfig[];
}
