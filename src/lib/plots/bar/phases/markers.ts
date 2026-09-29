import { resolveAccessor } from '$lib/plots/utils/accessors';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { isGapValue, resolveGapAreaStyle } from '$lib/plots/utils/gaps';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { BarMarkerConfig } from '$lib/types/markers/common';
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';

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
		const xFn = resolveAccessor(group.series.x);
		const yFn = resolveAccessor(group.series.y);
		const defaultColor = colorForSeries!(group.series.name);
		const disabledFill = ctx.disabledFillFor?.(group.series.name);

		// Builds one series' visible bar geometry (real or gap-fill data).
		function makeMarker(
			data: TData[],
			valueFn: (d: TData) => number,
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
				const baselineFn = (d: TData) => barLayout!.stackedBaseline(xFn(d), seriesIndex);
				const topFn = (d: TData) => baselineFn(d) + valueFn(d);
				if (isHorizontal) {
					marker.y = xFn;
					marker.x1 = baselineFn;
					marker.x2 = topFn;
				} else {
					marker.x = xFn;
					marker.y1 = baselineFn;
					marker.y2 = topFn;
				}
			} else {
				if (isHorizontal) {
					marker.y = xFn;
					marker.x1 = barLayout!.valueBaseline;
					marker.x2 = valueFn;
				} else {
					marker.x = xFn;
					marker.y1 = barLayout!.valueBaseline;
					marker.y2 = valueFn;
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
			const valueFn = barLayout!.layout === 'stacked' ? (d: TData) => Number(yFn(d)) : yFn;
			const marker = makeMarker(realData, valueFn, styles);
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
			const marker = makeMarker(taggedData, (d) => (d as GapFillRow<TData>).__gapValue, gapStyle);
			if (marker) segmentMarkers.push(marker);
		}
	});

	return { ...state, markers: [...segmentMarkers, ...(state.markers ?? [])] };
}
