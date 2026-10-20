import { Transforms } from '$lib/phases/transforms/Transforms';

import type { AreaPlotState, AreaPlotCtx } from '$lib/types/plots/area/state';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

/**
 * AreaPlot's "markers" phase: one `area` per visual segment of each series,
 * drawing the rows the "transforms" phase left (stacked, when the plot
 * stacks). The markers the "statistics" phase already put in `state.markers`
 * come after, so they render on top, and its value labels last - one at the
 * end of each series, like LinePlot's.
 *
 * A series toggled off in the legend (style mode), or dimmed by hovering
 * another series' value label, dims its own areas' fill to
 * `legend.disabledOpacity`, in place, so a stack keeps its full extent.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: AreaPlotState<TData>,
	ctx: AreaPlotCtx
): AxisBasedMarkersConfig[] {
	const { resolvedSeries = [] } = state;
	const { channels, options, transforms } = state.processedData!;
	const { cfg } = ctx;

	// A fill opacity per series name, for the dim: a legend-off series fades to
	// the legend's disabled opacity, every other one keeps the area default.
	const fillOpacityOf = (name: string) => {
		const off = ctx.interaction?.dimmed(name);
		return off ? (off.opacity ?? cfg.legend.disabledOpacity) : cfg.area.fillOpacity;
	};
	const dimmed = resolvedSeries.some((s) => ctx.interaction?.dimmed(s.name));
	const opacityScale = {
		range: Object.fromEntries(resolvedSeries.map((s) => [s.name, fillOpacityOf(s.name)]))
	};
	// The dim channel: each area reads its own series name, looked up in `opacityScale`.
	const dimByName = (name: string) =>
		dimmed ? { opacity: () => name, scales: { opacity: opacityScale } } : {};

	const areas = (state.processedGroups ?? []).flatMap((group) =>
		group.visualSegments.map((seg) =>
			Transforms.finish(
				{
					type: 'area',
					series: group.series.name,
					data: seg.data,
					...channels,
					...options,
					styles: seg.styles,
					...dimByName(group.series.name)
				},
				transforms
			)
		)
	) as unknown as AxisBasedMarkersConfig[];

	return areas;
}
