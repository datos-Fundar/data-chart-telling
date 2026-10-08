import type { Accessor, Series } from '$lib/types/plots/data/common';
import type { AxisValue } from '$lib/types/layout/mapping';

/* eslint-disable @typescript-eslint/no-explicit-any */
/** What differs between plots in the shared "data" stage. */
export type DataStageOptions<TState, TCtx> = {
	/** Whether adjacent visual segments share their boundary row - a continuous mark (line, area) does. Defaults to `true`. */
	connect?: boolean;
	/** The color a segment's own style sets, if any, for the markers scoped to its series. */
	segmentColor?: (style: any) => string | undefined;
	/** The key flat rows split into series by. Defaults to `grouping ?? color`. */
	grouping?: (state: TState) => Accessor<any, unknown> | undefined;
	/** The accessors flat rows build each series' `x`/`y` from. Defaults to the plot's own `x`/`y`. */
	seriesChannels?: (state: TState) => {
		x?: Accessor<any, AxisValue>;
		y?: Accessor<any, AxisValue>;
	};
	/** Tags or reorders the series once built, before colors and legend filtering. */
	orderSeries?: (series: Series<any>[], state: TState) => Series<any>[];
	/** The order colors are assigned in. Defaults to the series' own order. */
	colorOrder?: (series: Series<any>[]) => Series<any>[];
	/** The plot's own extra "data" output, once the shared one is in place. */
	extend?: (state: TState, ctx: TCtx) => TState;
};
/* eslint-enable @typescript-eslint/no-explicit-any */
