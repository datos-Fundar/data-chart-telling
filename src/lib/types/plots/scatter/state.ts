import type { Series, Accessor } from '$lib/types/plots/data/common';
import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { SegmentsConfig, MarginConfig } from '$lib/types/plots/props';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
import type { ResolvedChannel } from '$lib/types/layout/mapping';
import type { LegendInteractionStore } from '$lib/types/layout/legend';
import type { ChartConfig } from '$lib/types/configuration/styling';
import type { DotStyle } from '$lib/types/plots/styling';
import type { DotMarkerConfig } from '$lib/types/markers/common';

/** ScatterPlot's shared pipeline state — raw props plus every phase's own output. */
export type ScatterPlotState<TData extends Record<string, unknown>> = {
	series?: Series<TData>[];
	data?: TData[];
	x?: Accessor<TData, AxisValue>;
	y?: Accessor<TData, AxisValue>;
	/** Structural grouping key — defaults to `color` when unset (see `DataProps.grouping`). */
	grouping?: Accessor<TData, unknown>;
	color?: Accessor<TData, unknown>;
	r?: Accessor<TData, number> | number;
	segments: SegmentsConfig<ScatterSegmentStyle>;
	scales: AxisBasedScalesConfig<TData>;
	width: number;
	height: number;
	margins?: MarginConfig;

	// "data" phase output.
	resolvedSeries?: Series<TData>[];
	groupedSeries?: VisualGroup<Series<TData>, ScatterSegmentStyle>[];
	flat?: TData[];
	scopedGroups?: ScopedMarkerGroup<TData>[];
	colorForSeries?: (name: string) => string;

	// "mapping" phase output.
	channels?: {
		x: ResolvedChannel<TData>;
		y: ResolvedChannel<TData>;
		/** Absent when `r` isn't given; a literal pixel radius when `r` is a plain number (not scaled); a resolved per-row channel otherwise. */
		r?: ResolvedChannel<TData, number> | number;
		/** Row-level accessor resolved from `grouping ?? color` — the same accessor `buildSeries` already split series by. */
		grouping?: ResolvedChannel<TData, unknown>;
		/** Row-level accessor resolved from `color`, when set — independent of `colorForSeries`'s per-name resolution. */
		color?: ResolvedChannel<TData, unknown>;
	};

	// "markers" phase output.
	markers?: DotMarkerConfig[];
};

/** The environment every ScatterPlot phase reads from, alongside the growing state. */
export type ScatterPlotCtx = {
	cfg: ChartConfig;
	legendInteraction: LegendInteractionStore | null | undefined;
	disabledDotsFor?: (name: string) => DotStyle | undefined;
};
