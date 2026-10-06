import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { SegmentsConfig, MarginConfig } from '$lib/types/plots/props';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
import type { ChannelAccessors, ResolvedChannels } from '$lib/types/layout/mapping';
import type { LegendInteractionStore } from '$lib/types/layout/legend';
import type { ChartConfig } from '$lib/types/configuration/styling';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { MarkerTransform } from '$lib/types/transforms';
import type { ProcessedData } from '$lib/types/layout/phases/transforms';

/**
 * The pipeline state every axis-based plot shares — raw props plus every
 * phase's own output. A plot kind extends it with what only it has.
 * `TSeries` is the series shape the "data" phase resolves, and `TRow` what
 * `flat` holds, for a kind that tags its own rows.
 */
export type AxisPlotState<
	TData extends Record<string, unknown>,
	TStyle extends object,
	TSeries extends Series<TData> = Series<TData>,
	TRow = TData
> = ChannelAccessors<TData> & {
	series?: Series<TData>[];
	data?: TData[];
	segments?: SegmentsConfig<TStyle>;
	scales: AxisBasedScalesConfig<TData>;
	statistics?: StatisticConfig[];
	transforms?: MarkerTransform[];
	authorMarkers?: AxisBasedMarkersConfig[];
	width: number;
	height: number;
	margins?: MarginConfig;

	// "data" phase output.
	resolvedSeries?: TSeries[];
	/** Every series name, before legend-omitted ones are dropped, so colors stay put. */
	allSeriesNames?: string[];
	groupedSeries?: VisualGroup<TSeries, TStyle>[];
	flat?: TRow[];
	scopedGroups?: ScopedMarkerGroup<TData>[];
	colorForSeries?: (name: string) => string;

	// "mapping" phase output.
	channels?: ResolvedChannels<TData>;

	// "transforms" phase output: what the plot's own marks draw.
	processedData?: ProcessedData;

	// Accumulates from "statistics" onward: `authorMarkers` (each one's own
	// `.statistics` expanded in place) plus the top-level `statistics` prop
	// resolved against every resolved series, then "markers" prepends the
	// plot's own marks in front.
	markers?: AxisBasedMarkersConfig[];
};

/** The environment every axis-based plot's phases read from, alongside the growing state. */
export type AxisPlotCtx = {
	cfg: ChartConfig;
	legendInteraction: LegendInteractionStore | null | undefined;
};
