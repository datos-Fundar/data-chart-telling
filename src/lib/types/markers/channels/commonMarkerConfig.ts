import type { AxisValue, ChannelScalesConfig } from '$lib/types/layout/scales';
import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { MarkerTransform } from '$lib/types/transforms';

/** Props every marker kind shares: rows, grouping, series scope, position, statistics, transforms. */
export type CommonMarkerConfig = {
	data?: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	grouping?: string | ((d: any) => unknown);
	series?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	x?: AxisValue | ((d: any) => AxisValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	y?: AxisValue | ((d: any) => AxisValue);
	scales?: ChannelScalesConfig;
	statistics?: StatisticConfig[];
	transforms?: MarkerTransform[];
};
