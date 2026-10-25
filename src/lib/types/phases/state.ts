import type { Accessor, Series } from '$lib/types/plots/data/common';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type {
	SegmentsConfig,
	MarginConfig,
	HoverConfig,
	TooltipConfig
} from '$lib/types/plots/props';
import type { HoverPosition } from '$lib/types/phases/hover/phase';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
import type {
	AxisChannelName,
	ChannelAccessors,
	ResolvedChannels
} from '$lib/types/layout/mapping';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { MarkerTransform } from '$lib/types/transforms';
import type { ProcessedData, ProcessedRow } from '$lib/types/phases/transforms/phase';
import type { FacetStageState } from '$lib/types/phases/facet/phase';
import type { AxisBasedStylesConfig, ValuesStyle, ValueSelect } from '$lib/types/layout/styles';
import type { ValueLabels } from '$lib/layout/styles/ValueLabels';
import type { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import type { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { DiscreteGapFill, GapZonesConfig } from '$lib/types/plots/gaps';

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
	/** The axes whose domain the "scales" phase left to the kind's own fit, not the author's `domain`. */
	fittedAxes?: AxisChannelName[];
	statistics?: StatisticConfig[];
	transforms?: MarkerTransform[];
	authorMarkers?: AxisBasedMarkersConfig[];
	width: number;
	height: number;
	margins?: MarginConfig;
	/** The interval a point stands for, on the plots that draw one (`ForestPlot`): its lower and upper end, or the half-width around it, each a field key or a function of the row. */
	lower?: Accessor<TData, unknown>;
	upper?: Accessor<TData, unknown>;
	error?: Accessor<TData, unknown>;
	/** What a bar is measured against, on the plots that draw it (`BulletPlot`): a target, and the upper bounds of the bands grading it. Each is a number, a field key or a function of the row. */
	target?: unknown;
	ranges?: unknown[];
	/** The plot's `styles`, which `BasePlotLayout` draws its frame from. */
	styles?: AxisBasedStylesConfig;
	/** The plot's `styles.values`, which its "markers" phase turns into a value-label `text` marker. */
	values?: ValuesStyle;
	/** The plot's `tooltip`, resolved: the "hover" phase reads it. */
	tooltip?: TooltipConfig<TData>;
	/** The plot's `styles.gaps`: how a discrete mark fills each series' missing values. */
	gaps?: Record<string, GapZonesConfig<TStyle>>;
	/** The plot's facet, which the "facet" phase splits the rows into panels by. */
	facet?: FacetStageState['facet'];

	// "facet" phase output.
	panels?: FacetStageState['panels'];
	panelOf?: FacetStageState['panelOf'];

	// "data" phase output.
	/** What each position channel is, which one holds the categories, and which way the plot runs. */
	axes?: PlotAxes;
	resolvedSeries?: TSeries[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	seriesGrouping?: Accessor<any, unknown>;
	/** Every series name, before legend-omitted ones are dropped, so colors stay put. */
	allSeriesNames?: string[];
	groupedSeries?: VisualGroup<TSeries, TStyle>[];
	flat?: TRow[];
	scopedGroups?: ScopedMarkerGroup<TData>[];
	colorForSeries?: (name: string) => string;
	/** A discrete mark's gap fills, per series id: the value each missing row is drawn at. */
	gapFillMaps?: Map<string, Map<TData, DiscreteGapFill<TStyle>>>;

	// "mapping" phase output.
	channels?: ResolvedChannels<TData>;

	// "transforms" phase output: what the plot's own marks draw, and the same rows split into their visual groups.
	processedData?: ProcessedData;
	processedGroups?: VisualGroup<Series<ProcessedRow>, TStyle>[];
	/** The processed rows `styles.values` writes labels for, when the labels are on and the plot picks them. */
	labelled?: ProcessedRow[];
	/** What `styles.values.select` came to - the author's, else the plot's default. */
	labelSelects?: ValueSelect[];

	// "styles" phase output: `values` over the kind's own defaults.
	valueLabels?: ValueLabels;

	// Accumulates from "statistics" onward: `authorMarkers` (each one's own
	// `.statistics` expanded in place) plus the top-level `statistics` prop
	// resolved against every resolved series, then "markers" prepends the
	// plot's own marks in front.
	markers?: AxisBasedMarkersConfig[];

	// "tooltip" phase output: how a hovered row reads, unless `tooltip.format` says otherwise, and the order the rows read in.
	tooltipFormat?: (row: Record<string, unknown>) => string;
	tooltipSort?: (a: Record<string, unknown>, b: Record<string, unknown>) => number;

	// "hover" phase output: what the pointer can match and how the hover reads, the rows drawn and hovered, and where each sits.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	hover?: HoverConfig<any>;
	hoverPosition?: HoverPosition;
	hoverRows?: unknown[];
};

/** The environment every axis-based plot's phases read from, alongside the growing state. */
export type AxisPlotCtx = {
	cfg: PlotStylesConfig;
	/** The legend's toggles and the figure's hover, read for one plot: which series show and how each dims. */
	interaction?: PlotInteraction;
};
