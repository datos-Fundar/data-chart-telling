import type { ChartConfig } from '$lib/types/configuration/styling';
import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { Accessor, Series } from '$lib/types/plots/data/common';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { MarkerTransform } from '$lib/types/transforms';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';

/**
 * HistogramPlot's own state, accumulated phase by phase: its data input, the
 * series it resolves, the bins its rects draw, and the scales that cover them.
 */
export type HistogramPlotState<TData extends Record<string, unknown>> = {
	series?: Series<TData>[];
	data?: TData[];
	x?: Accessor<TData, AxisValue>;
	grouping?: Accessor<TData, unknown>;
	color?: Accessor<TData, unknown>;
	scales: AxisBasedScalesConfig<TData>;
	/** The plot's own transforms, merged over the default bin. */
	transforms: MarkerTransform[];
	/** Per-series styling: a segment's `styles` (e.g. `fillOpacity`) applies to the bars it covers. */
	segments?: SegmentsConfig<AreaStyle>;
	authorMarkers: AxisBasedMarkersConfig[];

	// "data" phase output.
	resolvedSeries?: Series<TData>[];
	// Every series name, before legend-omitted ones are dropped, so colors stay put.
	allSeriesNames?: string[];
	colorForSeries?: (name: string) => string;
	flat?: TData[];
	groupedSeries?: VisualGroup<Series<TData>, AreaStyle>[];
	scopedGroups?: ScopedMarkerGroup<TData>[];

	// "markers" phase output: the default bin rects (one per series, or one for flat data), then the author's own.
	binMarkers?: AxisBasedMarkersConfig[];
	markers?: AxisBasedMarkersConfig[];
};

/** The environment every HistogramPlot phase reads from, alongside the growing state. */
export type HistogramPlotCtx = {
	cfg: ChartConfig;
	legendInteraction: ReturnType<typeof getLegendInteraction>;
};
