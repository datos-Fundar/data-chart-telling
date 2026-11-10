import { buildMarks } from '$lib/plots/evolution/slope/markers';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { HoverDefaults } from '$lib/layout/hover/HoverDefaults';
import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import { buildLineDefaults } from '$lib/plots/evolution/line/defaults';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { SlopePlotState, SlopePlotEnv } from '$lib/types/plots/evolution/slope/state';

/**
 * SlopePlot on the shared pipeline: a LinePlot over a category axis of a few
 * positions - two, for a slope - with a dot on every point and its first and
 * last labelled, each before or after it.
 */
export function buildSlopeDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	SlopePlotState<TData>,
	SlopePlotEnv
> {
	const line = buildLineDefaults<TData>();
	return {
		...(line as AxisPlotDefaults<SlopePlotState<TData>, SlopePlotEnv>),
		data: { ...line.data, discreteAxes: 1 },
		transforms: { labels: { select: ['first', 'last'], skip: ValueLabels.skipGaps } },
		scales: {
			bandOrder: 'data',
			// The labels give the values, so the value axis stays out of their way.
			defaults: (_state, env) => ({
				category: { type: 'point', padding: env.cfg.slope.padding },
				value: { axisDisplay: 'none' }
			})
		},
		styles: {
			values: {
				anchor: 'start',
				format: (v, number, context) => `${context.series} - ${number(v)}`
			}
		},
		markers: { marks: buildMarks },
		// Only two positions: a rule along the value axis at the hovered point says more than one across them.
		hover: { ...line.hover, marker: (state) => HoverDefaults.valueRule(PlotAxes.valueOf(state)) }
	};
}
