import type { Accessor, Series } from '$lib/types/plots/data/common';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { ProcessedData } from './transforms';

/**
 * What the shared "statistics" stage reads from and writes to a plot's state.
 * Every axis-based plot state carries these fields, so each satisfies it by shape.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type StatisticsStageState = {
	x?: Accessor<any, AxisValue>;
	y?: Accessor<any, AxisValue>;
	grouping?: Accessor<any, unknown>;
	color?: Accessor<any, unknown>;
	statistics?: StatisticConfig[];
	authorMarkers?: AxisBasedMarkersConfig[];
	resolvedSeries?: Series<any>[];
	flat?: any[];
	colorForSeries?: (name: string) => string;
	/** The plot's rows after its own transforms, which an author marker without rows of its own draws. */
	processedData?: ProcessedData;
	markers?: AxisBasedMarkersConfig[];
};
/* eslint-enable @typescript-eslint/no-explicit-any */

/** What differs between plots in the shared "statistics" stage. */
export type StatisticsStageOptions<TState extends StatisticsStageState> = {
	/** The color an unscoped author marker inherits. Defaults to the first series' color. */
	defaultColor?: (state: TState) => string | undefined;
	/**
	 * Whether author markers inherit the plot's `grouping`/`color`. On by
	 * default; off for a plot whose `color` is a value channel, not a group.
	 */
	inheritGrouping?: boolean;
	/** Whether a line/area/dot author marker with no `x`/`y` takes the plot's own. */
	inheritPositions?: boolean;
};
