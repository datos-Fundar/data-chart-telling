import { buildSeries } from '$lib/utils/grouping';
import { omitDisabledSeries, resolveSeriesColorFor } from '$lib/plots/utils/legendDisabled';
import { buildGroupedSeries, buildScopedMarkerGroups } from '$lib/plots/utils/segments';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisPlotState, AxisPlotCtx, DataStageOptions } from '$lib/types/layout/phases';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAxisState = AxisPlotState<any, any, any, any>;

/**
 * The "data" stage every axis-based plot shares: its series (from `series`,
 * or flat rows split by the grouping key), each series' color, the series a
 * legend omits dropped, and each series cut into its styled visual segments.
 * Colors come from every series, before any is omitted, so they stay put.
 */
export function buildData<TState extends AnyAxisState, TCtx extends AxisPlotCtx>(
	options: DataStageOptions<TState, TCtx> = {}
): (state: TState, ctx: TCtx) => TState {
	return (state, ctx) => {
		const { series, data, segments, scales } = state;
		const { connect = true } = options;
		const grouping = options.grouping ? options.grouping(state) : (state.grouping ?? state.color);
		const channels = options.seriesChannels ? options.seriesChannels(state) : state;

		const built: Series[] = series ?? buildSeries(data!, channels.x!, channels.y!, grouping);
		const fullSeries = options.orderSeries ? options.orderSeries(built, state) : built;
		const colorForSeries = resolveSeriesColorFor(
			options.colorOrder ? options.colorOrder(fullSeries) : fullSeries,
			scales.color,
			ctx.cfg.palette
		);
		const resolvedSeries = omitDisabledSeries(fullSeries, ctx.legendInteraction);
		const groupedSeries = buildGroupedSeries(resolvedSeries, segments, connect);
		const scopedGroups = buildScopedMarkerGroups({
			groupedSeries,
			segments,
			colorFor: (s) => colorForSeries(s.name),
			segmentColorFor: (style, defaultColor) => options.segmentColor?.(style) ?? defaultColor
		});

		const next = {
			...state,
			resolvedSeries,
			allSeriesNames: fullSeries.map((s) => s.name),
			groupedSeries,
			flat: resolvedSeries.flatMap((s) => s.data),
			scopedGroups,
			colorForSeries
		} as TState;
		return options.extend ? options.extend(next, ctx) : next;
	};
}
