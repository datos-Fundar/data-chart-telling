import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { SeriesProps, DataProps, Accessor } from '$lib/types/plots/data/common';
import type { ConnectorBasedStylesConfig } from '$lib/types/layout/styles';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';

/**
 * The interval each point stands for, as fields of its row (or functions of
 * it): its `lower` and `upper` ends, or an `error` that reaches that far either
 * side of it. A point with none of them draws as a dot alone.
 */
export type ForestIntervalProps<TData extends Record<string, unknown>> = {
	/** The lower end of each row's interval. */
	lower?: Accessor<TData, number>;
	/** The upper end of each row's interval. */
	upper?: Accessor<TData, number>;
	/** The half-width of each row's interval: it reaches `error` below and above its value. `lower` and `upper` win where they are set. */
	error?: Accessor<TData, number>;
};

/** `ForestPlot`'s public props. */
export type ForestPlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	SeriesProps<TData> | DataProps<TData>,
	TData,
	ConnectorBasedStylesConfig,
	LineSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
> &
	ForestIntervalProps<TData>;

/** What `ForestPlot`'s core draws from. */
export type ForestPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	SeriesProps<TData> | DataProps<TData>,
	TData,
	ConnectorBasedStylesConfig,
	LineSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
> &
	ForestIntervalProps<TData>;
