import { buildMarks } from '$lib/plots/evolution/sparkline/markers';
import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import { buildLineDefaults } from '$lib/plots/evolution/line/defaults';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type {
	SparklinePlotState,
	SparklinePlotCtx
} from '$lib/types/plots/evolution/sparkline/state';

/**
 * SparklinePlot on the shared pipeline: a LinePlot with its axes left out, a
 * thin line, and a dot and value on the last point of each series.
 */
export function buildSparklineDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	SparklinePlotState<TData>,
	SparklinePlotCtx
> {
	const line = buildLineDefaults<TData>();
	return {
		...(line as AxisPlotDefaults<SparklinePlotState<TData>, SparklinePlotCtx>),
		transforms: { labels: { select: 'last', skip: ValueLabels.skipGaps, show: true } },
		scales: { defaults: () => ({ x: { axisDisplay: 'none' }, y: { axisDisplay: 'none' } }) },
		styles: {
			values: {
				...line.styles?.values,
				show: true,
				format: (value) => `${value}`
			}
		},
		markers: { marks: buildMarks, valueLabels: line.markers.valueLabels }
	};
}
