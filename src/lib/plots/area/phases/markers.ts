import { buildProcessedGroups } from '$lib/layout/phases/transforms';
import { finishTransforms } from '$lib/utils/transforms';
import { resolveEffectiveDisabledStyle } from '$lib/plots/utils/legendDisabled';
import { buildEndValueLabels } from '$lib/plots/utils/valueLabels';
import type { AreaPlotState, AreaPlotCtx } from '$lib/types/plots/area/state';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { AreaStyle } from '$lib/types/plots/styling';

/**
 * AreaPlot's "markers" phase: one `area` per visual segment of each series,
 * drawing the rows the "transforms" phase left (stacked, when the plot
 * stacks). The markers the "statistics" phase already put in `state.markers`
 * come after, so they render on top, and its value labels last — one at the
 * end of each series, like LinePlot's.
 *
 * A series toggled off in the legend (style mode), or dimmed by hovering
 * another series' value label, dims its own areas' fill to
 * `legend.disabledOpacity`, in place, so a stack keeps its full extent.
 */
export function buildMarkers<TData extends Record<string, unknown>>(
	state: AreaPlotState<TData>,
	ctx: AreaPlotCtx
): AreaPlotState<TData> {
	const { resolvedSeries = [] } = state;
	const { channels, options, transforms } = state.processedData!;
	const { cfg, legendInteraction } = ctx;

	// A fill opacity per series name, for the dim: a legend-off series fades to
	// the legend's disabled opacity, every other one keeps the area default.
	const offStyleOf =
		ctx.disabledFor ??
		((name: string) =>
			resolveEffectiveDisabledStyle(
				name,
				legendInteraction,
				cfg.legend.disabledOpacity,
				false,
				null
			));
	const fillOpacityOf = (name: string) => {
		const off = offStyleOf(name);
		return off ? (off.opacity ?? cfg.legend.disabledOpacity) : cfg.area.fillOpacity;
	};
	const dimmed = resolvedSeries.some((s) => offStyleOf(s.name));
	const opacityScale = {
		range: Object.fromEntries(resolvedSeries.map((s) => [s.name, fillOpacityOf(s.name)]))
	};
	// The dim channel: each area reads its own series name, looked up in `opacityScale`.
	const dimByName = (name: string) =>
		dimmed ? { opacity: () => name, scales: { opacity: opacityScale } } : {};

	const areas = buildProcessedGroups<AreaStyle>(state).flatMap((group) =>
		group.visualSegments.map((seg) =>
			finishTransforms(
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

	return {
		...state,
		markers: [...areas, ...(state.markers ?? []), ...buildEndValueLabels(state, ctx)]
	};
}
