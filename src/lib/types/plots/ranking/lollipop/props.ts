import type { AxesPlotProps, AxesPlotCoreProps } from '$lib/types/plots/families/axes';
import type { WithValues, DotValueLabel } from '$lib/types/layout/styles';
import type { SeriesProps, DualAxisDataProps } from '$lib/types/plots/data/common';
import type { ConnectorBasedStylesConfig } from '$lib/types/layout/styles';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';

/** `LollipopPlot`'s public props. */
export type LollipopPlotProps<TData extends Record<string, unknown>> = AxesPlotProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<ConnectorBasedStylesConfig, DotValueLabel>,
	LineSegmentStyle
>;

/** What `LollipopPlot`'s core draws from. */
export type LollipopPlotCoreProps<TData extends Record<string, unknown>> = AxesPlotCoreProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<ConnectorBasedStylesConfig, DotValueLabel>,
	LineSegmentStyle
>;
