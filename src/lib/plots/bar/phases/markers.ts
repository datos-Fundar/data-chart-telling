import { resolveAccessor } from '$lib/plots/utils/accessors';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { isGapValue, resolveGapAreaStyle } from '$lib/plots/utils/gaps';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { BarMarkerConfig } from '$lib/types/markers/common';
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';
import type { AxisValue } from '$lib/types/layout/mapping';

const GAP_KINDS = ['start', 'middle', 'end'] as const;

/** A gap-fill row tagged with its resolved value as a plain field. */
type GapFillRow<TData> = TData & { __gapValue: number };

/** BarPlot's "markers" phase: visible `role: 'segment'` bars — real data plus gap fills — prepended onto whatever the "statistics" phase already put in `state.markers`. */
export function buildMarkers<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>,
	ctx: BarPlotCtx
): BarPlotState<TData> {
	const { groupedSeries, isHorizontal, gapFillMaps, colorForSeries, barLayout } = state;
	const gapDefaults = getConfiguration().bar.gap;

	const segmentMarkers: BarMarkerConfig[] = [];
	groupedSeries!.forEach((group, seriesIndex) => {
		// Forwarded raw (a field key or function, whatever `series.x`/`.y` is)
		// into the marker's own category/value prop — svelteplot's own
		// `resolve()` already handles a field-key string per row, and only a
		// literal string (not a function) lets its axis-title auto-inference
		// see the field name. `keyof TData` is always a real string key in
		// practice, just not provably so to TypeScript here.
		const category = group.series.x as string | ((d: TData) => AxisValue);
		const rawValue = group.series.y as string | ((d: TData) => AxisValue);
		// Resolved (callable) copies for this phase's own internal math — gap
		// detection and the stacked span lookup — neither of which ever
		// becomes a marker's own x/y-scale prop, so staying a function here
		// doesn't affect axis titles either way.
		const xFn = resolveAccessor(group.series.x);
		const yFn = resolveAccessor(group.series.y);
		const defaultColor = colorForSeries!(group.series.name);
		const disabledFill = ctx.disabledFillFor?.(group.series.name);

		// Builds one series' visible bar geometry (real or gap-fill data).
		// `value` is what's forwarded into the marker's own x2/y2 prop for the
		// grouped layout (raw, for title inference); a stacked bar reads its
		// span off the plot-level stack instead.
		function makeMarker(
			data: TData[],
			value: number | string | ((d: TData) => AxisValue),
			styles: BarSegmentStyle
		): BarMarkerConfig | null {
			if (data.length === 0) return null;
			const marker: BarMarkerConfig = {
				type: 'bar',
				role: 'segment',
				isHorizontal: isHorizontal!,
				data,
				styles
			};
			if (barLayout!.layout === 'stacked') {
				// Where the plot-level stack placed this row's bar.
				const span = (d: TData) => barLayout!.stackedSpan(xFn(d), seriesIndex);
				const baselineFn = (d: TData) => span(d)?.[0] ?? barLayout!.valueBaseline;
				const topFn = (d: TData) => span(d)?.[1] ?? barLayout!.valueBaseline;
				if (isHorizontal) {
					marker.y = category;
					marker.x1 = baselineFn;
					marker.x2 = topFn;
				} else {
					marker.x = category;
					marker.y1 = baselineFn;
					marker.y2 = topFn;
				}
			} else {
				if (isHorizontal) {
					marker.y = category;
					marker.x1 = barLayout!.valueBaseline;
					marker.x2 = value;
				} else {
					marker.x = category;
					marker.y1 = barLayout!.valueBaseline;
					marker.y2 = value;
				}
				if (barLayout!.layout === 'grouped') {
					const { start, end } = barLayout!.groupInsetFraction(seriesIndex);
					if (isHorizontal) {
						marker.insetTop = start;
						marker.insetBottom = end;
					} else {
						marker.insetLeft = start;
						marker.insetRight = end;
					}
				}
			}
			return marker;
		}

		for (const seg of group.visualSegments) {
			const realData = seg.data.filter((d) => !isGapValue(yFn(d)));
			const styles: BarSegmentStyle = {
				fill: disabledFill?.fill ?? seg.styles.fill ?? defaultColor,
				fillOpacity: disabledFill?.fillOpacity ?? seg.styles.fillOpacity ?? 1
			};
			const marker = makeMarker(realData, rawValue, styles);
			if (marker) segmentMarkers.push(marker);
		}

		const fillMap =
			gapFillMaps!.get(group.series.name) ?? new Map<TData, DiscreteGapFill<BarSegmentStyle>>();
		for (const kind of GAP_KINDS) {
			const filledRows = group.series.data.filter((d) => fillMap.get(d)?.kind === kind);
			if (filledRows.length === 0) continue;
			const base = resolveGapAreaStyle(
				fillMap.get(filledRows[0])!.style,
				defaultColor,
				gapDefaults
			);
			const gapStyle: BarSegmentStyle = {
				...base,
				fill: disabledFill?.fill ?? base.fill,
				fillOpacity: disabledFill?.fillOpacity ?? base.fillOpacity
			};
			// Tags each row with its resolved gap-fill value as a plain field.
			const taggedData: GapFillRow<TData>[] = filledRows.map((d) => ({
				...d,
				__gapValue: fillMap.get(d)!.value
			}));
			// `__gapValue` is a synthetic field this phase invented, not a real
			// author-facing one — no field name worth surfacing as a title
			// either way, so a resolved accessor is forwarded as the `value`.
			const gapValueFn = (d: TData) => (d as GapFillRow<TData>).__gapValue;
			const marker = makeMarker(taggedData, gapValueFn, gapStyle);
			if (marker) segmentMarkers.push(marker);
		}
	});

	return { ...state, markers: [...segmentMarkers, ...(state.markers ?? [])] };
}
