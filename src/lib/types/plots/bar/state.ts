import type { GapZonesConfig } from '$lib/types/plots/gaps';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';
import type { AxisPlotState, AxisPlotCtx, ValueLabelsCtx } from '$lib/types/layout/phases';
import type { BarLayout } from './layout';

/** BarPlot's pipeline state: the shared axis-based state plus its gap fills and bar layout. */
export type BarPlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	BarSegmentStyle
> & {
	gaps?: Record<string, GapZonesConfig<BarSegmentStyle>>;

	// "data" phase output.
	gapFillMaps?: Map<string, Map<TData, DiscreteGapFill<BarSegmentStyle>>>;

	// "mapping" phase output.
	categoricalAxis?: 'x' | 'y';
	isHorizontal?: boolean;

	// "scales" phase output (`scales` gets overwritten too).
	barLayout?: BarLayout;
};

/** The environment every BarPlot phase reads from, alongside the growing state. */
export type BarPlotCtx = AxisPlotCtx & ValueLabelsCtx;
