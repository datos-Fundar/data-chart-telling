import type { ChartConfig } from '$lib/types/configuration/styling';
import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
import type { ResolvedChannel } from '$lib/types/layout/mapping';
import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { Accessor, Series } from '$lib/types/plots/data/common';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { MarkerTransform } from '$lib/types/transforms';
import type { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';

/**
 * AreaPlot's own state, accumulated phase by phase: its data input, the series
 * it resolves, and the markers, which the "statistics" phase starts (statistics,
 * then the author's own markers) and the "markers" phase prepends the default areas to.
 */
export type AreaPlotState<TData extends Record<string, unknown>> = {
	series?: Series<TData>[];
	data?: TData[];
	x?: Accessor<TData, AxisValue>;
	y?: Accessor<TData, AxisValue>;
	grouping?: Accessor<TData, unknown>;
	color?: Accessor<TData, unknown>;
	scales: AxisBasedScalesConfig<TData>;
	statistics: StatisticConfig[];
	segments?: SegmentsConfig<AreaStyle>;
	transforms?: MarkerTransform[];
	authorMarkers: AxisBasedMarkersConfig[];

	// "data" phase output.
	resolvedSeries?: Series<TData>[];
	// Every series name, before legend-omitted ones are dropped, so colors stay put.
	allSeriesNames?: string[];
	colorForSeries?: (name: string) => string;
	flat?: TData[];
	groupedSeries?: VisualGroup<Series<TData>, AreaStyle>[];
	scopedGroups?: ScopedMarkerGroup<TData>[];

	// "mapping" phase output.
	channels?: {
		x: ResolvedChannel<TData>;
		y: ResolvedChannel<TData>;
	};

	// "statistics" phase output, completed by "markers": every mark drawn on the plot.
	markers?: AxisBasedMarkersConfig[];
};

/** The environment every AreaPlot phase reads from, alongside the growing state. */
export type AreaPlotCtx = {
	cfg: ChartConfig;
	legendInteraction: ReturnType<typeof getLegendInteraction>;
};
