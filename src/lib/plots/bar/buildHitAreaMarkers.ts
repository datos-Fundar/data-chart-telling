import { resolveAccessor } from '$lib/plots/utils/accessors';
import { isGapValue } from '$lib/plots/utils/gaps';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { Series } from '$lib/types/plots/data/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { HoverPoint } from '$lib/types/layout/tooltip';
import type { BarMarkerConfig } from '$lib/types/markers/common';
import type { BarLayout } from '$lib/types/plots/bar/layout';

/** BarPlot's invisible `role: 'hitArea'` markers — one per real (non-gap) row of a hover-eligible series. */
export function buildHitAreaMarkers<TData extends Record<string, unknown>>(args: {
	groupedSeries: VisualGroup<Series<TData>, BarSegmentStyle>[];
	barLayout: BarLayout;
	isHorizontal: boolean;
	hoverPoints: HoverPoint<TData>[];
	/** Whether the built markers get pointer handlers attached. */
	active: boolean;
	setHoverMatch: (rows: TData[]) => void;
	clearHoverMatch: () => void;
}): BarMarkerConfig[] {
	const {
		groupedSeries,
		barLayout,
		isHorizontal,
		hoverPoints,
		active,
		setHoverMatch,
		clearHoverMatch
	} = args;
	const hoverEligibleSeries = new Set(hoverPoints.map((p) => p.series));

	const markers: BarMarkerConfig[] = [];
	groupedSeries.forEach((group, seriesIndex) => {
		if (!hoverEligibleSeries.has(group.series.name)) return;
		const xFn = resolveAccessor(group.series.x);
		const yFn = resolveAccessor(group.series.y);

		function makeHitAreaMarker(d: TData, valueFn: (d: TData) => number): BarMarkerConfig {
			const marker: BarMarkerConfig = {
				type: 'bar',
				role: 'hitArea',
				isHorizontal,
				data: [d],
				category: xFn(d) as AxisValue
			};
			if (barLayout.layout === 'stacked') {
				const [baseline, top] = barLayout.stackedSpan(xFn(d), seriesIndex) ?? [
					barLayout.valueBaseline,
					barLayout.valueBaseline
				];
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
			const valueFn = (d: TData) => Number(yFn(d));
			for (const d of realData) {
				const hitMarker = makeHitAreaMarker(d, valueFn);
				hitMarker.onpointerenter = active ? () => setHoverMatch([d]) : undefined;
				hitMarker.onpointerleave = active ? clearHoverMatch : undefined;
				markers.push(hitMarker);
			}
		}
	});

	return markers;
}
