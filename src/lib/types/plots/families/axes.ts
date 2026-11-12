import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { TooltipContext } from '$lib/types/layout/tooltip';

/** An axes kind's public props: its data contract, with the markers and scales of a plot drawn on axes. */
export type AxesPlotProps<
	TDataContract,
	TRow extends Record<string, unknown>,
	TStyles extends object,
	TSegmentStyle extends object,
	TTooltipContext extends TooltipContext = TooltipContext
> = BasePlotProps<
	TDataContract,
	TRow,
	TStyles,
	TSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TRow>,
	undefined,
	TTooltipContext
>;

/** What an axes kind's core draws from. */
export type AxesPlotCoreProps<
	TDataContract,
	TRow extends Record<string, unknown>,
	TStyles extends object,
	TSegmentStyle extends object
> = PlotCoreProps<
	TDataContract,
	TRow,
	TStyles,
	TSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TRow>
>;
