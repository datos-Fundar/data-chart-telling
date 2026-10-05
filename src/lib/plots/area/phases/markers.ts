import { prepareAuthorMarkers } from '$lib/utils/authorMarkers';
import { resolveAccessor } from '$lib/plots/utils/accessors';
import { resolveEffectiveDisabledStyle } from '$lib/plots/utils/legendDisabled';
import type { AreaPlotState, AreaPlotCtx } from '$lib/types/plots/area/state';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

/**
 * AreaPlot's "markers" phase. Every series gets its own filled `area` by
 * default: a series-based plot scopes one area to each series, while a flat
 * `data` plot gets one unscoped area that inherits the plot's grouping, so a
 * grouped plot draws one area per group. The markers the "statistics" phase
 * already put in `state.markers` come after, so they render on top.
 *
 * A series toggled off in the legend (style mode) dims its own area's fill to
 * `legend.disabledOpacity`. Each area stays one marker, so a stack keeps its
 * full extent while the dimmed bands fade in place.
 */
export function buildMarkers<TData extends Record<string, unknown>>(
	state: AreaPlotState<TData>,
	ctx: AreaPlotCtx
): AreaPlotState<TData> {
	const { resolvedSeries = [], colorForSeries, flat = [], series, x, y, grouping, color } = state;
	const { cfg, legendInteraction } = ctx;
	const plot = {
		grouping,
		color,
		defaultColor: resolvedSeries[0] && colorForSeries?.(resolvedSeries[0].name),
		colorForSeries
	};

	// The plot's own transforms (e.g. `stackY`) apply to every default area.
	const transforms = state.transforms;

	// A fill opacity per series name, for the dim: a legend-off series fades to
	// the legend's disabled opacity, every other one keeps the area default.
	const offStyleOf = (name: string) =>
		resolveEffectiveDisabledStyle(name, legendInteraction, cfg.legend.disabledOpacity, false, null);
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
	// A flat plot's one area holds every group, so its dim reads each row's group.
	const groupField = grouping ?? color;
	// The color domain is every series, not just the visible ones, so an omitted
	// series doesn't shift the colors of the rest (matches `colorForSeries`).
	const colorScale = {
		...state.scales.color,
		domain: state.scales.color?.domain ?? state.allSeriesNames
	};
	const dimByRow = {
		...(dimmed ? { opacity: resolveAccessor(groupField as keyof TData) } : {}),
		scales: { color: colorScale, ...(dimmed ? { opacity: opacityScale } : {}) }
	};
	// With segments, each series' visual segments become their own scoped areas,
	// each with its segment's styles. Without them, the default areas stay one
	// per series (or one for flat data), so the plot's transforms can stack them.
	const segmented = Object.keys(state.segments ?? {}).length > 0;
	const defaultAreas = (segmented && state.groupedSeries
		? state.groupedSeries.flatMap((group) =>
				group.visualSegments.map((seg) => ({
					type: 'area',
					series: group.series.name,
					x: group.series.x,
					y: group.series.y,
					data: seg.data,
					styles: seg.styles,
					transforms,
					...dimByName(group.series.name)
				}))
			)
		: series
			? resolvedSeries.map((s) => ({
					type: 'area',
					series: s.name,
					x: s.x,
					y: s.y,
					transforms,
					...dimByName(s.name)
				}))
			: [{ type: 'area', x, y, transforms, ...dimByRow }]) as unknown as AxisBasedMarkersConfig[];

	const markers: AxisBasedMarkersConfig[] = [
		...prepareAuthorMarkers(defaultAreas, { ...plot, flat, resolvedSeries }),
		...(state.markers ?? [])
	];

	return { ...state, markers };
}
