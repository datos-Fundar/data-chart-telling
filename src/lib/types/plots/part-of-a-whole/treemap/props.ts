import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { Accessor } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { TooltipProp } from '$lib/types/layout/tooltip';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { GroupingProp } from '$lib/utils/grouping';
import type { TreemapTile } from '$lib/types/transforms/treemap';

/** What a `TreemapPlot` draws its tiles from: one row per tile. */
export type TreemapDataProps<TData extends Record<string, unknown>> = {
	data: TData[];
	/** What a tile's area is: a numeric field or a function of the row. A row without a positive value has no tile. */
	value: Accessor<TData, number>;
	/**
	 * What the tiles nest by: a field, a function, or a list of them - the levels, outermost first. The last one names
	 * each tile, rows with the same value at every level are one tile, and the outermost colors the tiles and is what
	 * the legend lists.
	 */
	grouping?: GroupingProp<TData>;
	/** Colors the tiles by this instead of the outermost `grouping` level. */
	color?: Accessor<TData, unknown>;
	/** How a rectangle is split among its tiles. Defaults to `'squarify'`, which keeps them close to squares. */
	tile?: TreemapTile;
	series?: never;
	x?: never;
	y?: never;
};

/**
 * What a `TreemapPlot` knows of the tile a tooltip is about, the third argument of `tooltip.format`: the library
 * works out its share of the whole, so a `value` of any unit gives it.
 */
export type TreemapTooltipTile = {
	/** The tile's name: its value at the last `grouping` level. */
	name: string;
	/** Its value at every `grouping` level, outermost first. */
	path: string[];
	/** Its summed `value`. */
	value: number;
	/** Its part of the whole, from `0` to `100`. */
	share: number;
};

/** `TreemapPlot`'s public props. */
export type TreemapPlotProps<TData extends Record<string, unknown>> = Omit<
	BasePlotProps<
		TreemapDataProps<TData>,
		TData,
		AxisBasedStylesConfig,
		BarSegmentStyle,
		AxisBasedMarkersConfig,
		AxisBasedScalesConfig<TData>
	>,
	'tooltip'
> & {
	/** A tooltip with a tile for each hovered row: `format(row, number, tile)` gets its {@link TreemapTooltipTile}. */
	tooltip?: TooltipProp<TData, TreemapTooltipTile>;
};

/** What `TreemapPlot`'s core draws from: its rows, which the `treemap` transform lays out. */
export type TreemapPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	{ data: TData[]; x: unknown; y: unknown; grouping?: unknown; color?: unknown },
	TData,
	AxisBasedStylesConfig,
	BarSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
