import type { ChannelScalesConfig } from '$lib/types/layout/scales';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { MarkerTransform } from '$lib/types/transforms';
import type { MarkLegend } from '$lib/types/layout/legend';

/** Props every marker kind shares: rows, grouping, series scope, position, statistics, transforms. */
export type CommonMarkerConfig = {
	data?: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	grouping?: string | ((d: any) => unknown);
	series?: string;
	/**
	 * With `series` set, whether the marker draws once over the whole series
	 * (the default) or once per segment, over that segment's rows and in its
	 * color - so a `selectMaxY` marks each segment's own peak.
	 */
	scope?: 'series' | 'segment';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	x?: AxisValue | ((d: any) => AxisValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	y?: AxisValue | ((d: any) => AxisValue);
	scales?: ChannelScalesConfig;
	statistics?: StatisticConfig[];
	transforms?: MarkerTransform[];
	/** Clips the marker to the plot's frame. Unset, its kind's default applies. */
	clip?: boolean;
	/** Names the marker on its plot's automatic legend - see {@link MarkLegend}. */
	legend?: MarkLegend;
};
