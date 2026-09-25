import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { ScatterPlotState, ScatterPlotCtx } from '$lib/types/plots/scatter/state';
import type { DotMarkerConfig } from '$lib/types/markers/common';

/** ScatterPlot's "markers" phase: one `'dot'` marker per visual segment. */
export function buildMarkers<TData extends Record<string, unknown>>(
	state: ScatterPlotState<TData>,
	ctx: ScatterPlotCtx
): ScatterPlotState<TData> {
	const { groupedSeries, channels, colorForSeries } = state;
	const { cfg, disabledDotsFor } = ctx;
	const r = channels!.r;
	const rFn = r === undefined || typeof r === 'number' ? r : r.accessor;

	const markers: DotMarkerConfig[] = [];
	groupedSeries!.forEach((group) => {
		const defaultColor = colorForSeries!(group.series.name);
		const disabledDots = disabledDotsFor?.(group.series.name);
		const xFn = resolveAccessor(group.series.x);
		const yFn = resolveAccessor(group.series.y);

		for (const seg of group.visualSegments) {
			const dotStyle = seg.styles;
			markers.push({
				type: 'dot',
				data: seg.data,
				x: xFn,
				y: yFn,
				r: rFn,
				styles: {
					dotRadius: disabledDots?.dotRadius ?? dotStyle.dotRadius ?? cfg.scatter.dotRadius,
					dotFill: disabledDots?.dotFill ?? dotStyle.dotFill ?? defaultColor,
					dotSymbol: disabledDots?.dotSymbol ?? dotStyle.dotSymbol,
					dotStroke: disabledDots?.dotStroke ?? dotStyle.dotStroke,
					dotStrokeWidth: disabledDots?.dotStrokeWidth ?? dotStyle.dotStrokeWidth,
					dotFillOpacity: disabledDots?.dotFillOpacity ?? dotStyle.dotFillOpacity,
					dotStrokeOpacity: disabledDots?.dotStrokeOpacity ?? dotStyle.dotStrokeOpacity,
					dotStrokeDasharray: disabledDots?.dotStrokeDasharray ?? dotStyle.dotStrokeDasharray
				}
			});
		}
	});

	return { ...state, markers };
}
