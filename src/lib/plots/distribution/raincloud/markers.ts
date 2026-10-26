import { violinMarks } from '$lib/plots/distribution/violin/markers';
import { InnerBox } from '$lib/plots/distribution/box/InnerBox';
import { RaincloudLayout } from '$lib/plots/distribution/raincloud/layout';
import type {
	RaincloudPlotState,
	RaincloudPlotCtx
} from '$lib/types/plots/distribution/raincloud/state';
import type { RaincloudPlotStylesConfig } from '$lib/types/plots/distribution/raincloud/props';
import type { AxisBasedMarkersConfig, DotMarkerConfig } from '$lib/types/markers/common';

/**
 * RaincloudPlot's "markers" phase, per visual segment of each series: half a
 * `violin` (the cloud), a `dot` per row (the rain) and a narrow `box`, all in the
 * series' share of each category's band. The dots sit where the "transforms"
 * phase scattered them across the band (see `RaincloudLayout`). The markers the
 * "statistics" phase already put in `state.markers` come after, so they render on top.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: RaincloudPlotState<TData>,
	ctx: RaincloudPlotCtx
): AxisBasedMarkersConfig[] {
	const processed = state.processedData;
	if (!processed) return [];
	const { cfg } = ctx;
	const styles = state.styles as RaincloudPlotStylesConfig | undefined;
	const { channels, options } = processed;
	const groups = state.processedGroups ?? [];

	const clouds = violinMarks(state, ctx, {
		side: RaincloudLayout.toward(state) === 1 ? 'end' : 'start',
		fillOpacity: cfg.raincloud.fillOpacity
	});

	const rain = styles?.rain === false ? undefined : (styles?.rain ?? {});
	const drops: DotMarkerConfig[] = !rain
		? []
		: groups.flatMap((group, index) => {
				const name = group.series.name;
				// A series the legend or hover dims takes its dots' disabled style, field by field.
				const dimmed = Object.fromEntries(
					Object.entries(ctx.interaction?.dotsFor(name) ?? {}).filter(([, v]) => v !== undefined)
				);
				return group.visualSegments.map(
					(seg): DotMarkerConfig => ({
						type: 'dot',
						series: name,
						data: seg.data,
						x: channels.x as DotMarkerConfig['x'],
						y: channels.y as DotMarkerConfig['y'],
						bandOffsetX: options.bandOffsetX as DotMarkerConfig['bandOffsetX'],
						bandOffsetY: options.bandOffsetY as DotMarkerConfig['bandOffsetY'],
						slot: { index, count: groups.length },
						legend: false,
						styles: {
							dotRadius: rain.r ?? cfg.raincloud.dotRadius,
							dotFill: seg.styles.fill ?? state.colorForSeries!(name),
							dotFillOpacity: rain.opacity ?? cfg.raincloud.dotOpacity,
							dotStroke: 'none',
							...dimmed
						}
					})
				);
			});

	const box = InnerBox.resolve(styles?.box, cfg.raincloud.boxWidth);
	const boxes = box
		? InnerBox.markers(state, box, {
				ink: cfg.axis.color,
				center: RaincloudLayout.box(state),
				dimmed: (series) => ctx.interaction?.dimmed(series)
			})
		: [];

	return [...clouds, ...drops, ...boxes] as AxisBasedMarkersConfig[];
}
