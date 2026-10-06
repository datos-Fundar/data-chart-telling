import { prepareAuthorMarkers } from '$lib/utils/authorMarkers';
import type { ChartConfig } from '$lib/types/configuration/styling';
import type { HistogramPlotState, HistogramPlotCtx } from '$lib/types/plots/histogram/state';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { BinXTransform, MarkerTransform } from '$lib/types/transforms';

/**
 * The bin every histogram runs by default: counts per bin, with the configured
 * inset on each side of every bar. A plot's own `binX` is merged over it, its props winning.
 */
export function defaultBin(cfg: ChartConfig): BinXTransform {
	const { inset } = cfg.histogram;
	return { type: 'binX', y: 'count', insetLeft: inset, insetRight: inset };
}

/**
 * Merges the plot's own `binX` transforms over {@link defaultBin}, the
 * author's props winning, and keeps every other transform after it in order.
 * A histogram bins once, so several `binX` entries fold into one.
 */
export function buildTransforms(own: MarkerTransform[], cfg: ChartConfig): MarkerTransform[] {
	const bins = own.filter((t): t is BinXTransform => t.type === 'binX');
	const others = own.filter((t) => t.type !== 'binX');
	const bin = bins.reduce<BinXTransform>((merged, t) => ({ ...merged, ...t }), defaultBin(cfg));
	return [bin, ...others];
}

/**
 * HistogramPlot's "markers" phase. Every series gets its own `rect` marker
 * with the bin transform, so each series is binned on its own; flat data gets
 * one unscoped marker that bins per group. The author's markers come after.
 */
export function buildMarkers<TData extends Record<string, unknown>>(
	state: HistogramPlotState<TData>,
	ctx: HistogramPlotCtx
): HistogramPlotState<TData> {
	const { resolvedSeries = [], colorForSeries, flat = [], series, x, grouping, color } = state;
	const transforms = buildTransforms(state.transforms, ctx.cfg);
	const plot = {
		grouping,
		color,
		defaultColor: resolvedSeries[0] && colorForSeries?.(resolvedSeries[0].name),
		colorForSeries,
		flat,
		resolvedSeries
	};

	const fillOpacity = ctx.cfg.histogram.fillOpacity;
	// With segments, each visual segment of a series is its own bar set, with its
	// segment's styles, the way `area` draws its segments. Without them, the
	// default rect bins the whole series (or one unscoped rect for flat data).
	const segmented = Object.keys(state.segments ?? {}).length > 0 && state.groupedSeries;
	const defaultRects = (segmented
		? state.groupedSeries!.flatMap((group) =>
				group.visualSegments.map((seg) => ({
					type: 'rect',
					series: group.series.name,
					x: group.series.x,
					data: seg.data,
					transforms,
					styles: { fillOpacity: seg.styles.fillOpacity ?? fillOpacity, fill: seg.styles.fill }
				}))
			)
		: series
			? resolvedSeries.map((s) => ({
					type: 'rect',
					series: s.name,
					x: s.x,
					transforms,
					styles: { fillOpacity }
				}))
			: [
					{ type: 'rect', x, grouping: grouping ?? color, transforms, styles: { fillOpacity } }
				]) as unknown as AxisBasedMarkersConfig[];

	const binMarkers = prepareAuthorMarkers(defaultRects, plot);
	const authorMarkers = prepareAuthorMarkers(state.authorMarkers, plot);

	return {
		...state,
		transforms,
		binMarkers,
		markers: [...binMarkers, ...authorMarkers]
	};
}
