import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { ViolinProfiles } from '$lib/markers/violin/ViolinProfiles';
import type { ViolinPlotState, ViolinPlotCtx } from '$lib/types/plots/distribution/violin/state';
import type { ViolinPlotStylesConfig } from '$lib/types/plots/distribution/violin/props';
import type {
	AxisBasedMarkersConfig,
	BoxMarkerConfig,
	ViolinMarkerConfig
} from '$lib/types/markers/common';

/**
 * ViolinPlot's "markers" phase: one `violin` - and a narrow `box` over it - per visual
 * segment of each series, drawing a violin per category of its rows, filled with its series'
 * color (or its segment's own `fill`). Series share each category's band side
 * by side. The markers the "statistics" phase already put in `state.markers`
 * come after, so they render on top.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: ViolinPlotState<TData>,
	ctx: ViolinPlotCtx
): AxisBasedMarkersConfig[] {
	const processed = state.processedData;
	if (!processed) return [];
	const { cfg } = ctx;
	const styles = state.styles as ViolinPlotStylesConfig | undefined;
	const { channels } = processed;
	const groups = state.processedGroups ?? [];

	let peak: number | undefined;
	if (styles?.scale === 'shared') {
		const valueAxis = PlotAxes.valueOf(state);
		const position = ProcessedPositions.of(processed, valueAxis);
		const read = { category: position[PlotAxes.categoryOf(state)], value: position[valueAxis] };
		const estimate = { kernel: styles.kernel, bandwidth: styles.bandwidth, trim: styles.trim };
		peak = ViolinProfiles.peak(
			groups.flatMap((g) =>
				g.visualSegments.flatMap((s) => ViolinProfiles.of(s.data, read, estimate))
			)
		);
	}

	const boxWidth =
		styles?.box === false
			? undefined
			: typeof styles?.box === 'number'
				? styles.box
				: cfg.violin.boxWidth;
	const ink = cfg.axis.color;

	const violins = groups.flatMap((group, index) => {
		const name = group.series.name;
		const disabled = ctx.interaction?.fillFor(name);
		return group.visualSegments.map(
			(seg): ViolinMarkerConfig => ({
				type: 'violin',
				series: name,
				data: seg.data,
				x: channels.x as ViolinMarkerConfig['x'],
				y: channels.y as ViolinMarkerConfig['y'],
				kernel: styles?.kernel,
				bandwidth: styles?.bandwidth,
				trim: styles?.trim,
				peak,
				slot: { index, count: groups.length },
				styles: {
					...seg.styles,
					fill: disabled?.fill ?? seg.styles.fill ?? state.colorForSeries!(name),
					fillOpacity: disabled?.fillOpacity ?? seg.styles.fillOpacity ?? cfg.violin.fillOpacity
				}
			})
		);
	});

	// The box inside each violin: a narrow `box` marker in the axis color, its median a tick, with no outliers or caps.
	const boxes: BoxMarkerConfig[] =
		boxWidth === undefined
			? []
			: groups.flatMap((group, index) =>
					group.visualSegments.map(
						(seg): BoxMarkerConfig => ({
							type: 'box',
							series: group.series.name,
							data: seg.data,
							x: channels.x as BoxMarkerConfig['x'],
							y: channels.y as BoxMarkerConfig['y'],
							thickness: boxWidth,
							slot: { index, count: groups.length },
							bar: { fill: ink, fillOpacity: 1 },
							rule: { stroke: ink, strokeWidth: 1.5 },
							dot: { r: 0 },
							tickMinMax: false
						})
					)
				);

	return [...violins, ...boxes] as AxisBasedMarkersConfig[];
}
