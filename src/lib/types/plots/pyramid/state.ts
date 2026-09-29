import type { Series, Accessor } from '$lib/types/plots/data/common';
import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { SegmentsConfig, MarginConfig } from '$lib/types/plots/props';
import type { GapZonesConfig } from '$lib/types/plots/gaps';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';
import type { ChartConfig } from '$lib/types/configuration/styling';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { StatisticConfig } from '$lib/types/layout/statistics';

export type PyramidSide = 'left' | 'right';

/** A resolved series tagged with which side of the shared zero baseline it renders on. */
export type PyramidSeries<TData extends Record<string, unknown>> = Series<TData> & {
	side: PyramidSide;
};

/**
 * One row tagged with its resolved side/signed-magnitude/category/label as
 * plain fields — svelteplot shallow-clones each row before invoking a mark's
 * geometry accessors, so this is what survives that clone for hover matching.
 */
export type PyramidTaggedRow<TData extends Record<string, unknown>> = TData & {
	__side: PyramidSide;
	__x: number;
	__y: AxisValue;
	__label: string;
	__series: string;
};

/** PyramidPlot's shared pipeline state — raw props plus every phase's own output. */
export type PyramidPlotState<TData extends Record<string, unknown>> = {
	series?: Series<TData>[];
	data?: TData[];
	/** Magnitude accessor (the plot's `x` prop). */
	x?: Accessor<TData, AxisValue>;
	/** Category accessor (the plot's `y` prop). */
	y?: Accessor<TData, AxisValue>;
	/** Side-grouping accessor — defaults to `color` when unset (see `DataProps.grouping`). */
	grouping?: Accessor<TData, unknown>;
	color?: Accessor<TData, unknown>;
	segments: SegmentsConfig<BarSegmentStyle>;
	gaps: Record<string, GapZonesConfig<BarSegmentStyle>>;
	scales: AxisBasedScalesConfig<TData>;
	width: number;
	height: number;
	margins?: MarginConfig;
	authorMarkers?: AxisBasedMarkersConfig[];
	statistics?: StatisticConfig[];

	// "data" phase output.
	resolvedSeries?: PyramidSeries<TData>[];
	groupedSeries?: VisualGroup<PyramidSeries<TData>, BarSegmentStyle>[];
	gapFillMaps?: Map<string, Map<TData, DiscreteGapFill<BarSegmentStyle>>>;
	scopedGroups?: ScopedMarkerGroup<TData>[];
	colorForSeries?: (name: string) => string;

	// "mapping" phase output — tagged, hover-safe rows (gap rows already filtered out).
	flat?: PyramidTaggedRow<TData>[];

	// Accumulates from "statistics" onward: `authorMarkers` (each one's own
	// `.statistics` expanded in place) plus the top-level `statistics` prop
	// resolved against every resolved series, then "markers" prepends its own
	// segment bars in front.
	markers?: AxisBasedMarkersConfig[];
};

/**
 * The environment every PyramidPlot phase reads from, alongside the growing
 * state. No `legendInteraction` here — unlike Bar/Scatter, a pyramid never
 * omits a disabled series (that would break its left/right symmetry); legend
 * dimming stays a `Plot.svelte`-local concern instead.
 */
export type PyramidPlotCtx = {
	cfg: ChartConfig;
	formatValue: (value: number, seriesName: string) => string;
	disabledFillFor?: (name: string) => { fill?: string; fillOpacity?: number } | undefined;
};
