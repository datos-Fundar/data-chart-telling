import { resolveAccessor } from '$lib/plots/utils/accessors';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { isGapValue, resolveGapAreaStyle } from '$lib/plots/utils/gaps';
import type { AxisValue } from '$lib/types/layout/scales';
import type { Series } from '$lib/types/plots/data/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { HoverPoint } from '$lib/types/layout/tooltip';
import type { BarMarkerConfig } from '$lib/types/markers/common';
import type { BarLayout } from './layout.svelte';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';

const GAP_KINDS = ['start', 'middle', 'end'] as const;

/** A gap-fill row tagged with its resolved value as a plain field. */
type GapFillRow<TData> = TData & { __gapValue: number };

/**
 * Every `'bar'` marker for one BarPlot render: visible `role: 'segment'`
 * bars (real data + gap fills) plus one `role: 'hitArea'` hit region per row,
 * sized to that row's own segment.
 */
export function buildBarMarkers<TData extends Record<string, unknown>>(args: {
	groupedSeries: VisualGroup<Series<TData>, BarSegmentStyle>[];
	barLayout: BarLayout<TData>;
	isHorizontal: boolean;
	hoverPoints: HoverPoint<TData>[];
	colorFor: (seriesName: string) => string;
	disabledFillFor: (seriesName: string) => { fill?: string; fillOpacity?: number } | undefined;
	active: boolean;
	setHoverMatch: (rows: TData[]) => void;
	clearHoverMatch: () => void;
	gapFillMaps: Map<string, Map<TData, DiscreteGapFill<BarSegmentStyle>>>;
}): BarMarkerConfig[] {
	const {
		groupedSeries,
		barLayout,
		isHorizontal,
		hoverPoints,
		colorFor,
		disabledFillFor,
		active,
		setHoverMatch,
		clearHoverMatch,
		gapFillMaps
	} = args;
	const gapDefaults = getConfiguration().bar.gap;

	// Series names eligible for hover (excludes legend-disabled ones).
	const hoverEligibleSeries = new Set(hoverPoints.map((p) => p.series));

	const segmentMarkers: BarMarkerConfig[] = [];
	const hitAreaMarkers: BarMarkerConfig[] = [];
	groupedSeries.forEach((group, seriesIndex) => {
		const xFn = resolveAccessor(group.series.x);
		const yFn = resolveAccessor(group.series.y);
		const defaultColor = colorFor(group.series.name);
		const disabledFill = disabledFillFor(group.series.name);

		// Builds one series' visible bar geometry (real or gap-fill data).
		function makeMarker(
			data: TData[],
			valueFn: (d: TData) => number,
			style: BarSegmentStyle
		): BarMarkerConfig | null {
			if (data.length === 0) return null;
			const marker: BarMarkerConfig = { type: 'bar', role: 'segment', isHorizontal, data, style };
			if (barLayout.layout === 'stacked') {
				const baselineFn = (d: TData) => barLayout.stackedBaseline(xFn(d), seriesIndex);
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
					marker.x1 = barLayout.valueBaseline;
					marker.x2 = valueFn;
				} else {
					marker.x = xFn;
					marker.y1 = barLayout.valueBaseline;
					marker.y2 = valueFn;
				}
				if (barLayout.layout === 'grouped') {
					const { start, end } = barLayout.groupInsetFraction(seriesIndex);
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

		// Builds one row's hit-test geometry — same shape as `makeMarker`, for one row.
		function makeHitAreaMarker(d: TData, valueFn: (d: TData) => number): BarMarkerConfig {
			const marker: BarMarkerConfig = {
				type: 'bar',
				role: 'hitArea',
				isHorizontal,
				data: [d],
				category: xFn(d) as AxisValue
			};
			if (barLayout.layout === 'stacked') {
				const baseline = barLayout.stackedBaseline(xFn(d), seriesIndex);
				const top = baseline + valueFn(d);
				if (isHorizontal) {
					marker.x1 = baseline;
					marker.x2 = top;
				} else {
					marker.y1 = baseline;
					marker.y2 = top;
				}
			} else {
				if (isHorizontal) {
					marker.x1 = barLayout.valueBaseline;
					marker.x2 = valueFn(d);
				} else {
					marker.y1 = barLayout.valueBaseline;
					marker.y2 = valueFn(d);
				}
				if (barLayout.layout === 'grouped') {
					const { start, end } = barLayout.groupInsetFraction(seriesIndex);
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
			const style: BarSegmentStyle = {
				fill: disabledFill?.fill ?? seg.style.fill ?? defaultColor,
				fillOpacity: disabledFill?.fillOpacity ?? seg.style.fillOpacity ?? 1
			};
			const valueFn = barLayout.layout === 'stacked' ? (d: TData) => Number(yFn(d)) : yFn;
			const marker = makeMarker(realData, valueFn, style);
			if (marker) segmentMarkers.push(marker);

			if (hoverEligibleSeries.has(group.series.name)) {
				for (const d of realData) {
					const hitMarker = makeHitAreaMarker(d, valueFn);
					hitMarker.onpointerenter = active ? () => setHoverMatch([d]) : undefined;
					hitMarker.onpointerleave = active ? clearHoverMatch : undefined;
					hitAreaMarkers.push(hitMarker);
				}
			}
		}

		const fillMap =
			gapFillMaps.get(group.series.name) ?? new Map<TData, DiscreteGapFill<BarSegmentStyle>>();
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

	return [...segmentMarkers, ...hitAreaMarkers];
}
