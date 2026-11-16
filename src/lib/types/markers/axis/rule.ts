import type { AnyRowContext, PlotRowContext, RowFunction } from '$lib/types/layout/context';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { StrokeStyle, PerRow, InsetStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/**
 * A vertical or horizontal reference line, one line per row when `data` is given, or one per value
 * when `value` is a list - all with the same style.
 */
export type RuleMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'rule';
	axis: 'x' | 'y';
	/**
	 * Where the line goes along `axis`. A list draws a line at each value (without `data`); with `data`,
	 * a field key or a function of the row gives each row's own.
	 */
	value: AxisValue | string | (AxisValue | string)[] | RowFunction<AxisValue, TContext>;
	styles?: PerRow<StrokeStyle & InsetStyle, TContext>;
} & CommonMarkerConfigWithInterval<TContext>;
