import type { Series, Accessor } from '$lib/types/plots/data/common';
import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { SegmentsConfig, MarginConfig } from '$lib/types/plots/props';
import type { GapZonesConfig } from '$lib/types/plots/gaps';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
import type { ResolvedChannel } from '$lib/types/layout/mapping';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';
import type { LegendInteractionStore } from '$lib/types/layout/legend';
import type { ChartConfig } from '$lib/types/configuration/styling';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { BarLayout } from './layout';

/** BarPlot's shared pipeline state — raw props plus every phase's own output. */
export type BarPlotState<TData extends Record<string, unknown>> = {
	series?: Series<TData>[];
	data?: TData[];
	x?: Accessor<TData, AxisValue>;
	y?: Accessor<TData, AxisValue>;
	/** Structural grouping key — defaults to `color` when unset (see `DataProps.grouping`). */
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
	resolvedSeries?: Series<TData>[];
	groupedSeries?: VisualGroup<Series<TData>, BarSegmentStyle>[];
	gapFillMaps?: Map<string, Map<TData, DiscreteGapFill<BarSegmentStyle>>>;
	flat?: TData[];
	scopedGroups?: ScopedMarkerGroup<TData>[];
	colorForSeries?: (name: string) => string;

	// "mapping" phase output.
	categoricalAxis?: 'x' | 'y';
	isHorizontal?: boolean;
	channels?: {
		x: ResolvedChannel<TData>;
		y: ResolvedChannel<TData>;
		/** Row-level accessor resolved from `grouping ?? color` — the same accessor `buildSeries` already split series by. */
		grouping?: ResolvedChannel<TData, unknown>;
		/** Row-level accessor resolved from `color`, when set — independent of `colorForSeries`'s per-name resolution. */
		color?: ResolvedChannel<TData, unknown>;
	};

	// "scales" phase output (`scales` above gets overwritten too).
	barLayout?: BarLayout;

	// Accumulates from "statistics" onward: `authorMarkers` (each one's own
	// `.statistics` expanded in place) plus the top-level `statistics` prop
	// resolved against every resolved series, then "markers" prepends its own
	// segment/gap-fill markers in front — see `buildHitAreaMarkers` for the
	// one marker kind that stays outside this pipeline (hit-areas).
	markers?: AxisBasedMarkersConfig[];
};

/** The environment every BarPlot phase reads from, alongside the growing state. */
export type BarPlotCtx = {
	cfg: ChartConfig;
	legendInteraction: LegendInteractionStore | null | undefined;
	disabledFillFor?: (name: string) => { fill?: string; fillOpacity?: number } | undefined;
};
