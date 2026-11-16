import type { ChannelScalesConfig } from '$lib/types/layout/scales';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { MarkerTransform } from '$lib/types/transforms';
import type { MarkLegend } from '$lib/types/layout/legend';
import type { AnyRowContext, PlotRowContext, RowFunction } from '$lib/types/layout/context';
import type { CommonMarkerEvents } from '$lib/types/markers/channels/commonMarkerEvents';

/** Props every marker kind shares: rows, grouping, series scope, position, offset, statistics, transforms. */
export type CommonMarkerConfig<TContext extends PlotRowContext = AnyRowContext> =
	CommonMarkerEvents & {
		data?: Record<string, unknown>[];
		grouping?: string | RowFunction<unknown, TContext>;
		series?: string;
		/**
		 * With `series` set, whether the marker draws once over the whole series
		 * (the default) or once per segment, over that segment's rows and in its
		 * color - so a `selectMaxY` marks each segment's own peak.
		 */
		scope?: 'series' | 'segment';
		x?: AxisValue | RowFunction<AxisValue, TContext>;
		y?: AxisValue | RowFunction<AxisValue, TContext>;
		scales?: ChannelScalesConfig;
		statistics?: StatisticConfig[];
		transforms?: MarkerTransform<TContext>[];
		/** Moves the marker this many pixels right, after it is placed. Also applies on a map, where svelteplot itself ignores it. */
		dx?: number;
		/** Moves the marker this many pixels down, after it is placed. */
		dy?: number;
		/** Clips the marker to the plot's frame. Unset, its kind's default applies. */
		clip?: boolean;
		/** Names the marker on its plot's automatic legend - see {@link MarkLegend}. `false` keeps a decorative marker out of it, and out of how the plot's series look there. */
		legend?: MarkLegend | false;
		/**
		 * Links the marker to the plot's hover. `'trigger'` makes it a hit area: the pointer entering any of its shapes
		 * hovers its `data` rows. `'style'` has its shapes take the hover marker's `active` and `others` styles.
		 * `true` does both.
		 */
		hover?: boolean | 'trigger' | 'style';
	};
