import { buildAxisStages, runStages } from '$lib/layout/phases/stages';
import { buildFacetAxisValues } from '$lib/layout/shell/facetScales';
import type { Accessor } from '$lib/types/plots/data/common';
import type { AxisChannelName, ChannelName, ResolvedChannel } from '$lib/types/layout/mapping';
import type { AxisPlotKind, PhaseStage, PlotPhase, ProcessedData } from '$lib/types/layout/phases';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { FacetAxisValues } from '$lib/types/plots/presentation';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyAxisPlotKind = AxisPlotKind<any, any>;
/* eslint-enable @typescript-eslint/no-explicit-any */

/** The core props an axis plot kind seeds its pipeline from. */
export type AxisPipelineProps<TData extends Record<string, unknown>> = {
	data?: TData[];
	x?: Accessor<TData, unknown>;
	y?: Accessor<TData, unknown>;
	grouping?: Accessor<TData, unknown>;
	color?: Accessor<TData, unknown>;
	opacity?: unknown;
	segments?: unknown;
	styles?: { gaps?: unknown; values?: unknown };
	scales?: object;
	width?: number;
	height?: number;
	margins?: unknown;
	markers?: unknown[];
	statistics?: unknown[];
	transforms?: unknown[];
};

/** The pipeline state fields the shell reads. */
export type AxisPlotStateLike = {
	processedData?: ProcessedData;
	markers?: object[];
	categoricalAxis?: AxisChannelName;
	channels?: Partial<Record<ChannelName, ResolvedChannel<unknown, unknown> | number>>;
	scales?: AxisBasedScalesConfig<never>;
	[key: string]: unknown;
};

/** A plot kind's pipeline over some rows, up to (and including) `phases`. */
function buildPipeline<TData extends Record<string, unknown>>(
	kind: AnyAxisPlotKind,
	props: AxisPipelineProps<TData>,
	cfg: PlotStylesConfig,
	phases: PlotPhase[]
) {
	const stages = (buildAxisStages(kind) as PhaseStage<AxisPlotStateLike, unknown>[]).filter(
		(stage) => phases.includes(stage.phase)
	);
	const ctx = { cfg, legendInteraction: null, formatValue: (v: number) => String(v) };
	const state = (rows: TData[]): AxisPlotStateLike => ({
		data: rows,
		x: props.x,
		y: props.y,
		grouping: props.grouping,
		color: props.color,
		opacity: props.opacity,
		segments: props.segments ?? {},
		gaps: props.styles?.gaps,
		values: props.styles?.values,
		scales: (props.scales ?? {}) as AxisBasedScalesConfig<never>,
		width: props.width,
		height: props.height,
		margins: props.margins,
		authorMarkers: props.markers ?? [],
		statistics: props.statistics ?? [],
		transforms: props.transforms ?? []
	});
	return { stages, ctx, state, run: (rows: TData[]) => runStages(stages, state(rows), ctx) };
}

/** `facetAxisValues` for an axis plot kind: its placing phases run over one facet's rows. */
export function buildAxisFacetAxisValues<TData extends Record<string, unknown>>(
	kind: AnyAxisPlotKind,
	props: AxisPipelineProps<TData>,
	cfg: PlotStylesConfig,
	options: {
		band?: (state: AxisPlotStateLike) => AxisChannelName[];
		zero?: (state: AxisPlotStateLike) => AxisChannelName[];
	} = {}
): (rows: TData[]) => FacetAxisValues {
	const { stages, ctx, state } = buildPipeline(kind, props, cfg, [
		'data',
		'mapping',
		'transforms',
		'statistics'
	]);
	return buildFacetAxisValues<TData, AxisPlotStateLike, unknown>({ stages, state, ctx, ...options });
}

/** `sliceScales` for an axis plot kind: the domains its "scales" phase gives `channels` over every row. */
export function buildAxisSliceScales<TData extends Record<string, unknown>>(
	kind: AnyAxisPlotKind,
	props: AxisPipelineProps<TData>,
	cfg: PlotStylesConfig,
	channels: (keyof AxisBasedScalesConfig<TData>)[]
): (rows: TData[]) => AxisBasedScalesConfig<TData> {
	const pipeline = buildPipeline(kind, props, cfg, [
		'data',
		'mapping',
		'transforms',
		'statistics',
		'scales'
	]);
	return (rows) => {
		const scales = (pipeline.run(rows).scales ?? {}) as Record<string, { domain?: unknown }>;
		const shared: Record<string, { domain: unknown }> = {};
		for (const channel of channels) {
			const domain = scales[channel]?.domain;
			if (domain !== undefined) shared[channel] = { domain };
		}
		return shared as AxisBasedScalesConfig<TData>;
	};
}

/**
 * The timeline's default tween for an axis plot kind, from the channels its
 * "mapping" phase resolves over `props.data`: rows matched by the values of
 * whichever `key` channels are set, `value` tweened. `undefined` when `value` isn't set.
 */
export function buildAxisInterpolation<TData extends Record<string, unknown>>(
	kind: AnyAxisPlotKind,
	props: AxisPipelineProps<TData>,
	cfg: PlotStylesConfig,
	channels: { value: ChannelName; key: ChannelName[] }
): { value: Accessor<TData, never>; key?: Accessor<TData, unknown> } | undefined {
	if (!props.data) return undefined;
	const resolved = buildPipeline(kind, props, cfg, ['data', 'mapping']).run(props.data).channels;
	const channel = (name: ChannelName) => {
		const c = resolved?.[name];
		return typeof c === 'object' ? (c as ResolvedChannel<TData, unknown>) : undefined;
	};
	const value = channel(channels.value)?.source;
	if (value === undefined) return undefined;
	const keys = channels.key
		.map(channel)
		.filter((c): c is ResolvedChannel<TData, unknown> => c?.source !== undefined);
	const key: Accessor<TData, unknown> | undefined =
		keys.length > 1
			? (row: TData) => keys.map((c) => String(c.accessor(row))).join('::')
			: (keys[0]?.source as Accessor<TData, unknown> | undefined);
	return { value: value as unknown as Accessor<TData, never>, key };
}
