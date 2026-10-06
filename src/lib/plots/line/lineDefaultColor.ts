import type { LinePlotState } from '$lib/types/plots/line/state';

/**
 * The color an unscoped marker inherits on a LinePlot: the line's own stroke
 * when its first segment restyles it (a segment's `stroke` overrides the
 * series color), otherwise the first series' default color.
 */
export function lineDefaultColor<TData extends Record<string, unknown>>(
	state: LinePlotState<TData>
): string | undefined {
	const segmentStroke = state.groupedSeries?.[0]?.visualSegments?.[0]?.styles?.stroke?.stroke;
	if (typeof segmentStroke === 'string') return segmentStroke;
	return state.resolvedSeries?.[0] && state.colorForSeries?.(state.resolvedSeries[0].name);
}
