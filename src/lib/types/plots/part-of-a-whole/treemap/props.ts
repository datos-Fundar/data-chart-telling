import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { NonAxisDataProps } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { TooltipContext } from '$lib/types/layout/tooltip';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';

/** What a `TreemapPlot` knows of a hovered tile beyond its row, the third argument of `tooltip.format`. */
export type TreemapTooltipContext = TooltipContext & {
	/** The tile's part of the whole, from `0` to `100`, worked out from the values in whatever unit they are. */
	share: number;
};

/**
 * `TreemapPlot`'s public props: flat rows, a tile each, on no axes. `value` is a tile's area, and `grouping` what
 * the tiles nest by (`'sector.branch'`, outermost first), whose outermost level colors them.
 */
export type TreemapPlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	NonAxisDataProps<TData, 'value'>,
	TData,
	AxisBasedStylesConfig,
	BarSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>,
	undefined,
	TreemapTooltipContext
>;

/** What `TreemapPlot`'s core draws from. */
export type TreemapPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	NonAxisDataProps<TData, 'value'>,
	TData,
	AxisBasedStylesConfig,
	BarSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
