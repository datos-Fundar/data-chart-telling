import { resolveAccessor } from '$lib/plots/utils/accessors';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { resolveGapRuns, resolveGapsForSeries } from '$lib/plots/utils/gaps';
import type { GapPoint } from '$lib/plots/utils/gaps';
import type { Series } from '$lib/types/plots/data/common';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { StrokeStyle, DotStyle } from '$lib/types/plots/styling';
import type { LineMarkerConfig, DotMarkerConfig } from '$lib/types/markers/common';
import type { LinePlotState, LinePlotCtx } from '$lib/types/plots/line/state';

/**
 * Every `'line'` (+ `'dot'`, where a segment's style asks for them) marker
 * for one LinePlot render: one `'line'` marker per visual segment, plus a
 * `'dot'` marker right after it when that segment sets `style.dots`.
 */
export function buildLineMarkers<TData extends Record<string, unknown>>(args: {
	groupedSeries: VisualGroup<Series<TData>, LineSegmentStyle>[];
	colorFor: (seriesName: string) => string;
	disabledStrokeFor: (seriesName: string) => StrokeStyle | undefined;
	disabledDotsFor: (seriesName: string) => DotStyle | undefined;
}): (LineMarkerConfig | DotMarkerConfig)[] {
	const { groupedSeries, colorFor, disabledStrokeFor, disabledDotsFor } = args;
	const cfg = getConfiguration();

	const markers: (LineMarkerConfig | DotMarkerConfig)[] = [];
	groupedSeries.forEach((group) => {
		const defaultColor = colorFor(group.series.name);
		const disabledStroke = disabledStrokeFor(group.series.name);
		const disabledDots = disabledDotsFor(group.series.name);
		const xFn = resolveAccessor(group.series.x);
		const yFn = resolveAccessor(group.series.y);

		for (const seg of group.visualSegments) {
			const strokeStyle = seg.styles.stroke;
			const dotStyle = seg.styles.dots;
			markers.push({
				type: 'line',
				data: seg.data,
				x: xFn,
				y: yFn,
				styles: {
					stroke: disabledStroke?.stroke ?? strokeStyle?.stroke ?? defaultColor,
					strokeWidth:
						disabledStroke?.strokeWidth ?? strokeStyle?.strokeWidth ?? cfg.line.strokeWidth,
					strokeOpacity: disabledStroke?.strokeOpacity ?? strokeStyle?.strokeOpacity ?? 1,
					strokeDasharray: disabledStroke?.strokeDasharray ?? strokeStyle?.strokeDasharray,
					strokeLinejoin: disabledStroke?.strokeLinejoin ?? strokeStyle?.strokeLinejoin,
					strokeLinecap: disabledStroke?.strokeLinecap ?? strokeStyle?.strokeLinecap
				}
			});

			if (!dotStyle) continue;
			markers.push({
				type: 'dot',
				data: seg.data,
				x: xFn,
				y: yFn,
				styles: {
					dotRadius: disabledDots?.dotRadius ?? dotStyle.dotRadius ?? cfg.line.dotRadius,
					dotFill: disabledDots?.dotFill ?? dotStyle.dotFill ?? strokeStyle?.stroke ?? defaultColor,
					dotSymbol: disabledDots?.dotSymbol ?? dotStyle.dotSymbol ?? 'circle',
					dotStroke:
						disabledDots?.dotStroke ?? dotStyle.dotStroke ?? strokeStyle?.stroke ?? defaultColor,
					dotStrokeWidth: disabledDots?.dotStrokeWidth ?? dotStyle.dotStrokeWidth ?? 1,
					dotFillOpacity:
						disabledDots?.dotFillOpacity ??
						dotStyle.dotFillOpacity ??
						strokeStyle?.strokeOpacity ??
						1,
					dotStrokeOpacity:
						disabledDots?.dotStrokeOpacity ??
						dotStyle.dotStrokeOpacity ??
						strokeStyle?.strokeOpacity ??
						1,
					dotStrokeDasharray: disabledDots?.dotStrokeDasharray ?? dotStyle.dotStrokeDasharray
				}
			});
		}
	});

	return markers;
}

const gx = (p: GapPoint) => p.x;
const gy = (p: GapPoint) => p.y;

/**
 * One `'line'` (+ `'dot'`, when its zone sets `style.dots`) marker per
 * detected, configured gap run across every series — the interpolated
 * bridge drawn over a missing-data hole. `gaps` is resolved per series the
 * same way `segments` is (a named entry, falling back to `'default'` at
 * zone granularity — see `resolveGapsForSeries`). Defaults to the series'
 * own colour with `cfg.line.gap`'s stroke/dot styling (dashed and slightly
 * muted out of the box), so a gap-fill reads as estimated rather than real
 * data unless a zone or the global configuration overrides it. Dots (when
 * requested) are drawn only at a run's two endpoints, not along every
 * sampled bridge point. `disabledStrokeFor`/`disabledDotsFor` mirror
 * `buildLineMarkers`'s own params — a legend-disabled (or hover-isolated)
 * series must dim its gap bridge exactly like it dims the real line it's
 * bridging, so both take the same precedence: disabled override, then the
 * gap zone's own style, then the shared gap default.
 */
export function buildGapMarkers<TData extends Record<string, unknown>>(args: {
	seriesList: Series<TData>[];
	gaps: GapsConfig<LineSegmentStyle>;
	colorFor: (seriesIndex: number) => string;
	disabledStrokeFor: (seriesName: string) => StrokeStyle | undefined;
	disabledDotsFor: (seriesName: string) => DotStyle | undefined;
}): (LineMarkerConfig | DotMarkerConfig)[] {
	const { seriesList, gaps, colorFor, disabledStrokeFor, disabledDotsFor } = args;
	const cfg = getConfiguration();
	const gapDefaults = cfg.line.gap;
	const markers: (LineMarkerConfig | DotMarkerConfig)[] = [];

	seriesList.forEach((series, seriesIndex) => {
		const zones = resolveGapsForSeries(gaps, series.name);
		const runs = resolveGapRuns(series, zones);
		if (runs.length === 0) return;
		const defaultColor = colorFor(seriesIndex);
		const disabledStroke = disabledStrokeFor(series.name);
		const disabledDots = disabledDotsFor(series.name);

		for (const run of runs) {
			const strokeStyle = run.zone.style?.stroke;
			const dotStyle = run.zone.style?.dots;

			markers.push({
				type: 'line',
				data: run.points,
				x: gx,
				y: gy,
				styles: {
					stroke: disabledStroke?.stroke ?? strokeStyle?.stroke ?? defaultColor,
					strokeWidth:
						disabledStroke?.strokeWidth ??
						strokeStyle?.strokeWidth ??
						gapDefaults.stroke.strokeWidth ??
						cfg.line.strokeWidth,
					strokeOpacity:
						disabledStroke?.strokeOpacity ??
						strokeStyle?.strokeOpacity ??
						gapDefaults.stroke.strokeOpacity,
					strokeDasharray:
						disabledStroke?.strokeDasharray ??
						strokeStyle?.strokeDasharray ??
						gapDefaults.stroke.strokeDasharray,
					strokeLinejoin:
						disabledStroke?.strokeLinejoin ??
						strokeStyle?.strokeLinejoin ??
						gapDefaults.stroke.strokeLinejoin,
					strokeLinecap:
						disabledStroke?.strokeLinecap ??
						strokeStyle?.strokeLinecap ??
						gapDefaults.stroke.strokeLinecap
				}
			});

			if (!dotStyle) continue;
			const dotDefaults = gapDefaults.dots;
			const endpoints = [run.points[0], run.points[run.points.length - 1]];
			markers.push({
				type: 'dot',
				data: endpoints,
				x: gx,
				y: gy,
				styles: {
					dotRadius:
						disabledDots?.dotRadius ??
						dotStyle.dotRadius ??
						dotDefaults.dotRadius ??
						cfg.line.dotRadius,
					dotFill:
						disabledDots?.dotFill ??
						dotStyle.dotFill ??
						strokeStyle?.stroke ??
						dotDefaults.dotFill ??
						defaultColor,
					dotSymbol:
						disabledDots?.dotSymbol ?? dotStyle.dotSymbol ?? dotDefaults.dotSymbol ?? 'circle',
					dotStroke:
						disabledDots?.dotStroke ??
						dotStyle.dotStroke ??
						strokeStyle?.stroke ??
						dotDefaults.dotStroke ??
						defaultColor,
					dotStrokeWidth:
						disabledDots?.dotStrokeWidth ??
						dotStyle.dotStrokeWidth ??
						dotDefaults.dotStrokeWidth ??
						1,
					dotFillOpacity:
						disabledDots?.dotFillOpacity ??
						dotStyle.dotFillOpacity ??
						dotDefaults.dotFillOpacity ??
						1,
					dotStrokeOpacity:
						disabledDots?.dotStrokeOpacity ??
						dotStyle.dotStrokeOpacity ??
						dotDefaults.dotStrokeOpacity ??
						1,
					dotStrokeDasharray:
						disabledDots?.dotStrokeDasharray ??
						dotStyle.dotStrokeDasharray ??
						dotDefaults.dotStrokeDasharray
				}
			});
		}
	});

	return markers;
}

/** LinePlot's "markers" phase: real line/dot segments plus interpolated gap bridges — prepended onto whatever the "statistics" phase already put in `state.markers`. */
export function buildMarkers<TData extends Record<string, unknown>>(
	state: LinePlotState<TData>,
	ctx: LinePlotCtx
): LinePlotState<TData> {
	const { groupedSeries, resolvedSeries, colorForSeries, gaps } = state;
	const disabledStrokeFor = (name: string) => ctx.disabledStrokeFor?.(name);
	const disabledDotsFor = (name: string) => ctx.disabledDotsFor?.(name);

	const lineMarkers = buildLineMarkers({
		groupedSeries: groupedSeries!,
		colorFor: colorForSeries!,
		disabledStrokeFor,
		disabledDotsFor
	});

	const gapMarkers = buildGapMarkers({
		seriesList: resolvedSeries!,
		gaps,
		colorFor: (seriesIndex) => colorForSeries!(resolvedSeries![seriesIndex].name),
		disabledStrokeFor,
		disabledDotsFor
	});

	return { ...state, markers: [...lineMarkers, ...gapMarkers, ...(state.markers ?? [])] };
}
