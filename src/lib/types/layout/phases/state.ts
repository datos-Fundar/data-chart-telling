import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { SegmentsConfig, MarginConfig } from '$lib/types/plots/props';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
import type { ChannelAccessors, ResolvedChannels } from '$lib/types/layout/mapping';
import type { LegendInteractionStore } from '$lib/types/layout/legend';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { MarkerTransform } from '$lib/types/transforms';
import type { ProcessedData } from '$lib/types/layout/phases/transforms';
import type { ValuesStyle } from '$lib/types/layout/styles';
import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';

/**
 * The pipeline state every axis-based plot shares - raw props plus every
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
	/** The plot's `styles.values`, which its "markers" phase turns into a value-label `text` marker. */
	values?: ValuesStyle;

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

	// "tooltip" phase output: how a hovered row reads, unless `tooltip.format` says otherwise.
	tooltipFormat?: (row: Record<string, unknown>) => string;
};

/** The environment every axis-based plot's phases read from, alongside the growing state. */
export type AxisPlotCtx = {
	cfg: PlotStylesConfig;
	legendInteraction: LegendInteractionStore | null | undefined;
};

/** The hooks a plot's value-label `text` marker reports through, back to its own `Plot.svelte`. */
export type ValueLabelsCtx = {
	/** A series' legend or hover-isolate dimming, if any. */
	disabledFillFor?: (name: string) => { fill?: string; fillOpacity?: number } | undefined;
	/** Reports how far the value labels reach past the content box, so the plot grows its margin. */
	onValueLabelOverflow?: (overflow: MarginOverflow) => void;
	/** The series whose value label the pointer is over, or `null` once it leaves. */
	onValueLabelHover?: (name: string | null) => void;
};
