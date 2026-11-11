import type { WithValues, DotValueLabel } from '$lib/types/layout/styles';
import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { SeriesProps, DualAxisDataProps } from '$lib/types/plots/data/common';
import type { ConnectorBasedStylesConfig } from '$lib/types/layout/styles';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';

/** `LollipopPlot`'s public props. */
export type LollipopPlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<ConnectorBasedStylesConfig, DotValueLabel>,
	LineSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;

/** What `LollipopPlot`'s core draws from. */
export type LollipopPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<ConnectorBasedStylesConfig, DotValueLabel>,
	LineSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
