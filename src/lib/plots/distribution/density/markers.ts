import { Transforms } from '$lib/phases/transforms/Transforms';
import type { DensityPlotState, DensityPlotCtx } from '$lib/types/plots/distribution/density/state';
import type { DensityPlotStylesConfig } from '$lib/types/plots/distribution/density/props';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

/**
 * DensityPlot's "markers" phase: one `area` - or `line`, by `styles.mark` - per
 * visual segment of each series, drawing that segment's estimate, dimmed with
 * its series. The markers the "statistics" phase already put in `state.markers`
 * come after.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: DensityPlotState<TData>,
	ctx: DensityPlotCtx
): AxisBasedMarkersConfig[] {
	const { channels, options, transforms } = state.processedData!;
	const { cfg } = ctx;
	const styles = state.styles as DensityPlotStylesConfig | undefined;
	const asLine = styles?.mark === 'line';

	return (state.processedGroups ?? []).flatMap((group) => {
		const name = group.series.name;
		const disabledFill = ctx.interaction?.fillFor(name);
		const disabledStroke = ctx.interaction?.strokeFor(name);
		return group.visualSegments.map((seg) => {
			const color = seg.styles.fill ?? state.colorForSeries!(name);
			const style = asLine
				? {
						stroke: disabledStroke?.stroke ?? seg.styles.stroke ?? color,
						strokeWidth:
							disabledStroke?.strokeWidth ?? seg.styles.strokeWidth ?? cfg.density.strokeWidth,
						strokeOpacity: disabledStroke?.strokeOpacity ?? seg.styles.strokeOpacity,
						strokeDasharray: disabledStroke?.strokeDasharray ?? seg.styles.strokeDasharray
					}
				: {
						...seg.styles,
						fill: disabledFill?.fill ?? color,
						fillOpacity:
							disabledFill?.fillOpacity ?? seg.styles.fillOpacity ?? cfg.density.fillOpacity
					};
			return Transforms.finish(
				{
					type: asLine ? 'line' : 'area',
					series: name,
					data: seg.data,
					...channels,
					...options,
					curve: styles?.curve,
					styles: style
				},
				transforms
			);
		});
	}) as unknown as AxisBasedMarkersConfig[];
}
