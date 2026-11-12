import type { WithValues } from '$lib/types/layout/styles';
import type { BoxLabelConfig } from '$lib/types/markers/labels/box';
import type { GraphPlotProps, GraphPlotCoreProps } from '$lib/types/plots/families/graph';
import type { NonAxisDataProps } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { KindRowContext } from '$lib/types/layout/context';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';

/**
 * What a `TreemapPlot` knows of a tile, which its tooltip's and value labels' `format`, its hover and
 * `usePlot().contextOf` read: its series (the outermost level), and what the plot works out for it. Its `value`
 * is the tile's summed value, and it has no `x` or `y`.
 */
export type TreemapRowContext = KindRowContext<{
	/** The tile's name: the value at its innermost level. */
	name: string;
	/** The value at every level of the tile, outermost first. */
	path: string[];
	/** The tile's part of the whole, from `0` to `100`, worked out from the values in whatever unit they are. */
	share: number;
}>;

/** What a `TreemapPlot`'s `tooltip.format` gets in its third argument - see {@link TreemapRowContext}. */
export type TreemapTooltipContext = TreemapRowContext;

/**
 * `TreemapPlot`'s public props: flat rows, a tile each, on no axes. `value` is a tile's area, and `grouping` what
 * the tiles nest by (`'sector.branch'`, outermost first), whose outermost level colors them.
 */
export type TreemapPlotProps<TData extends Record<string, unknown>> = GraphPlotProps<
	NonAxisDataProps<TData, 'value'>,
	TData,
	WithValues<AxisBasedStylesConfig, BoxLabelConfig>,
	BarSegmentStyle,
	TreemapTooltipContext
>;

/** What `TreemapPlot`'s core draws from. */
export type TreemapPlotCoreProps<TData extends Record<string, unknown>> = GraphPlotCoreProps<
	NonAxisDataProps<TData, 'value'>,
	TData,
	WithValues<AxisBasedStylesConfig, BoxLabelConfig>,
	BarSegmentStyle
>;
