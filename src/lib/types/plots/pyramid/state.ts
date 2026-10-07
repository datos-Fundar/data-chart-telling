import type { Series } from '$lib/types/plots/data/common';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { GapZonesConfig } from '$lib/types/plots/gaps';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';
import type { AxisPlotState, AxisPlotCtx, ValueLabelsCtx } from '$lib/types/layout/phases';

export type PyramidSide = 'left' | 'right';

/** A resolved series tagged with which side of the shared zero baseline it renders on. */
export type PyramidSeries<TData extends Record<string, unknown>> = Series<TData> & {
	side: PyramidSide;
};

/**
 * One row tagged with its resolved side/signed-magnitude/category/label as
 * plain fields — svelteplot shallow-clones each row before invoking a mark's
 * geometry accessors, so this is what survives that clone for hover matching.
 */
export type PyramidTaggedRow<TData extends Record<string, unknown>> = TData & {
	__side: PyramidSide;
	__x: number;
	__y: AxisValue;
	__label: string;
	__series: string;
};

/**
 * PyramidPlot's pipeline state: the shared axis-based state with its own series
 * and row shapes. `x` is the magnitude accessor and `y` the category one; the
 * "mapping" phase leaves `flat` as tagged, hover-safe rows (gap rows filtered out).
 */
export type PyramidPlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	BarSegmentStyle,
	PyramidSeries<TData>,
	PyramidTaggedRow<TData>
> & {
	gaps?: Record<string, GapZonesConfig<BarSegmentStyle>>;

	// "data" phase output.
	gapFillMaps?: Map<string, Map<TData, DiscreteGapFill<BarSegmentStyle>>>;
};

/** The environment every PyramidPlot phase reads from, alongside the growing state. */
export type PyramidPlotCtx = AxisPlotCtx &
	ValueLabelsCtx & {
		formatValue: (value: number, seriesName: string) => string;
	};
