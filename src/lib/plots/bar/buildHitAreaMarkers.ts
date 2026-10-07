import type { HoverPoint } from '$lib/types/layout/tooltip';
import type { BarMarkerConfig } from '$lib/types/markers/common';
import type { BarLayout } from '$lib/types/plots/bar/layout';

/** BarPlot's invisible `role: 'hitArea'` markers — one per hover candidate, covering its own bar. */
export function buildHitAreaMarkers<TData extends Record<string, unknown>>(args: {
	barLayout: BarLayout;
	isHorizontal: boolean;
	hoverPoints: HoverPoint<TData>[];
	/** Whether the built markers get pointer handlers attached. */
	active: boolean;
	setHoverMatch: (rows: TData[]) => void;
	clearHoverMatch: () => void;
}): BarMarkerConfig[] {
	const { barLayout, isHorizontal, hoverPoints, active, setHoverMatch, clearHoverMatch } = args;

	return hoverPoints.map(({ row, series }) => {
		const [from, to] = barLayout.spanOf(row) ?? [barLayout.valueBaseline, barLayout.valueBaseline];
		const marker: BarMarkerConfig = {
			type: 'bar',
			role: 'hitArea',
			isHorizontal,
			data: [row],
			category: barLayout.categoryOf(row),
			...(isHorizontal ? { x1: from, x2: to } : { y1: from, y2: to }),
			onpointerenter: active ? () => setHoverMatch([row]) : undefined,
			onpointerleave: active ? clearHoverMatch : undefined
		};
		if (barLayout.layout === 'grouped') {
			const { start, end } = barLayout.groupInsetFraction(barLayout.seriesIndexOf(series!));
			if (isHorizontal) {
				marker.insetTop = start;
				marker.insetBottom = end;
			} else {
				marker.insetLeft = start;
				marker.insetRight = end;
			}
		}
		return marker;
	});
}
