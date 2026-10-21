import { buildMarks } from '$lib/plots/evolution/line/markers';
import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { LinePlotState, LinePlotCtx } from '$lib/types/plots/evolution/line/state';

/** LinePlot on the shared pipeline: continuous segments colored by their stroke, and its own markers. Its plot defaults to: hover along x, cumulative timeline tweening `y` per series. */
export function buildLineDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	LinePlotState<TData>,
	LinePlotCtx
> {
	return {
		data: { segments: { color: (style: LineSegmentStyle | undefined) => style?.stroke?.stroke } },
		statistics: {
			// An unscoped marker takes the line's own stroke when its first segment restyles it,
			// else the first series' color.
			defaultColor: (state) => {
				const stroke = state.groupedSeries?.[0]?.visualSegments?.[0]?.styles?.stroke?.stroke;
				if (typeof stroke === 'string') return stroke;
				return state.resolvedSeries?.[0] && state.colorForSeries?.(state.resolvedSeries[0].name);
			}
		},
		transforms: { labels: { select: 'last', skip: ValueLabels.skipGaps } },
		styles: {
			values: {
				anchor: 'start',
				format: (v, name) => `${name} - ${v}`,
				reach: (labels, state) => labels.reachAtSeriesEnds(state)
			}
		},
		markers: {
			marks: buildMarks,
			valueLabels: (labels, state) => labels.atSeriesEnds(state)
		},
		timeline: { filterMode: 'upTo', interpolation: { value: 'y', key: ['grouping'] } }
	};
}
