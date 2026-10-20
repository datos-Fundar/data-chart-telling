import type { BoxPlotState, BoxPlotCtx } from '$lib/types/plots/box/state';
import type { AxisBasedMarkersConfig, BoxMarkerConfig } from '$lib/types/markers/common';

/**
 * BoxPlot's "markers" phase: one `box` per visual segment of each series,
 * one box per category of its rows, filled with its series' color (or its
 * segment's own `fill`). The markers the "statistics" phase already put in
 * `state.markers` come after, so they render on top.
 *
 * A series toggled off in the legend (style mode), or dimmed by hovering
 * another one, takes the legend's disabled fill.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: BoxPlotState<TData>,
	ctx: BoxPlotCtx
): AxisBasedMarkersConfig[] {
	const { channels } = state.processedData!;
	const { cfg } = ctx;

	return (state.processedGroups ?? []).flatMap((group) => {
		const name = group.series.name;
		const disabled = ctx.interaction?.fillFor(name);
		return group.visualSegments.map((seg): BoxMarkerConfig => {
			const { stroke, strokeWidth, strokeOpacity, borderRadius } = seg.styles;
			const outline = { stroke, strokeWidth, strokeOpacity, borderRadius };
			return {
				type: 'box',
				series: name,
				data: seg.data,
				x: channels.x as BoxMarkerConfig['x'],
				y: channels.y as BoxMarkerConfig['y'],
				bar: {
					// The box's own outline, from its segment; unset fields stay svelteplot's.
					...Object.fromEntries(Object.entries(outline).filter(([, v]) => v !== undefined)),
					fill: disabled?.fill ?? seg.styles.fill ?? state.colorForSeries!(name),
					fillOpacity: disabled?.fillOpacity ?? seg.styles.fillOpacity ?? cfg.box.fillOpacity
				}
			};
		});
	});
}
