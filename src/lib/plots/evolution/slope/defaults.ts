import { buildMarks, buildValueLabels } from '$lib/plots/evolution/slope/markers';
import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import { buildLineDefaults } from '$lib/plots/evolution/line/defaults';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { SlopePlotState, SlopePlotCtx } from '$lib/types/plots/evolution/slope/state';

/**
 * SlopePlot on the shared pipeline: a LinePlot over a category axis of a few
 * positions - two, for a slope - with a dot on every point and its first and
 * last labelled, each before or after it.
 */
export function buildSlopeDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	SlopePlotState<TData>,
	SlopePlotCtx
> {
	const line = buildLineDefaults<TData>();
	return {
		...(line as AxisPlotDefaults<SlopePlotState<TData>, SlopePlotCtx>),
		data: { ...line.data, discreteAxes: 1 },
		transforms: { labels: { select: ['first', 'last'], skip: ValueLabels.skipGaps } },
		scales: {
			bandOrder: 'data',
			// The labels give the values, so the value axis stays out of their way.
			defaults: (_state, ctx) => ({
				category: { type: 'point', padding: ctx.cfg.slope.padding },
				value: { axisDisplay: 'none' }
			})
		},
		styles: {
			values: {
				anchor: 'start',
				format: (v, name) => `${name} - ${v}`
			}
		},
		markers: { marks: buildMarks, valueLabels: buildValueLabels }
	};
}
