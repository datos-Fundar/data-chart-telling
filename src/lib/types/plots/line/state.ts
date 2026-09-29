import type { Series, Accessor } from '$lib/types/plots/data/common';
import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { SegmentsConfig, MarginConfig } from '$lib/types/plots/props';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
import type { ResolvedChannel } from '$lib/types/layout/mapping';
import type { LegendInteractionStore } from '$lib/types/layout/legend';
import type { ChartConfig } from '$lib/types/configuration/styling';
import type { StrokeStyle, DotStyle } from '$lib/types/plots/styling';
import type { LineMarkersConfig } from '$lib/types/markers/line';
import type { StatisticConfig } from '$lib/types/layout/statistics';

/** LinePlot's shared pipeline state — raw props plus every phase's own output. */
export type LinePlotState<TData extends Record<string, unknown>> = {
	series?: Series<TData>[];
	data?: TData[];
	x?: Accessor<TData, AxisValue>;
	y?: Accessor<TData, AxisValue>;
	/** Structural grouping key — defaults to `color` when unset (see `DataProps.grouping`). */
	grouping?: Accessor<TData, unknown>;
	color?: Accessor<TData, unknown>;
	segments: SegmentsConfig<LineSegmentStyle>;
	gaps: GapsConfig<LineSegmentStyle>;
	scales: AxisBasedScalesConfig<TData>;
	width: number;
	height: number;
	margins?: MarginConfig;
	authorMarkers?: LineMarkersConfig[];
	statistics?: StatisticConfig[];

	// "data" phase output.
	resolvedSeries?: Series<TData>[];
	groupedSeries?: VisualGroup<Series<TData>, LineSegmentStyle>[];
	flat?: TData[];
	scopedGroups?: ScopedMarkerGroup<TData>[];
	colorForSeries?: (name: string) => string;

	// "mapping" phase output.
	channels?: {
		x: ResolvedChannel<TData>;
		y: ResolvedChannel<TData>;
		/** Row-level accessor resolved from `grouping ?? color` — the same accessor `buildSeries` already split series by. */
		grouping?: ResolvedChannel<TData, unknown>;
		/** Row-level accessor resolved from `color`, when set — independent of `colorForSeries`'s per-name resolution. */
		color?: ResolvedChannel<TData, unknown>;
	};

	// Accumulates from "statistics" onward: `authorMarkers` (each one's own
	// `.statistics` expanded in place) plus the top-level `statistics` prop
	// resolved against every resolved series, then "markers" prepends its own
	// real segments plus gap bridges in front. No "scales" phase — LinePlot
	// forwards `scales` unresolved to `BasePlotLayout`.
	markers?: LineMarkersConfig[];
};

/** The environment every LinePlot phase reads from, alongside the growing state. */
export type LinePlotCtx = {
	cfg: ChartConfig;
	legendInteraction: LegendInteractionStore | null | undefined;
	disabledStrokeFor?: (name: string) => StrokeStyle | undefined;
	disabledDotsFor?: (name: string) => DotStyle | undefined;
};
