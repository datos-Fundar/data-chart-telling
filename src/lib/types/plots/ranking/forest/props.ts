import type { AxesPlotProps, AxesPlotCoreProps } from '$lib/types/plots/families/axes';
import type { WithValues, DotValueLabel } from '$lib/types/layout/styles';
import type { SeriesProps, DualAxisDataProps, Accessor } from '$lib/types/plots/data/common';
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

/** The values of a forest's row its value labels can write: its estimate, and its interval's ends. */
export type ForestValuePart = 'value' | 'lower' | 'upper';

/** `ForestPlot`'s public props. */
export type ForestPlotProps<TData extends Record<string, unknown>> = AxesPlotProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<ConnectorBasedStylesConfig, DotValueLabel, ForestValuePart>,
	LineSegmentStyle
> &
	ForestIntervalProps<TData>;

/** What `ForestPlot`'s core draws from. */
export type ForestPlotCoreProps<TData extends Record<string, unknown>> = AxesPlotCoreProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<ConnectorBasedStylesConfig, DotValueLabel, ForestValuePart>,
	LineSegmentStyle
> &
	ForestIntervalProps<TData>;
