import type { AxisValue } from '$lib/types/layout/mapping';
import type { StrokeStyle, PerRow, InsetStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/**
 * A vertical or horizontal reference line, one line per row when `data` is given, or one per value
 * when `value` is a list - all with the same style.
 */
export type RuleMarkerConfig = {
	type: 'rule';
	axis: 'x' | 'y';
	/**
	 * Where the line goes along `axis`. A list draws a line at each value (without `data`); with `data`,
	 * a field key or a function of the row gives each row's own.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: AxisValue | string | (AxisValue | string)[] | ((d: any) => AxisValue);
	styles?: PerRow<StrokeStyle & InsetStyle>;
} & CommonMarkerConfigWithInterval;
