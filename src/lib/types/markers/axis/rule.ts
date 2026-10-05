import type { AxisValue } from '$lib/types/layout/scales';
import type { StrokeStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/** A vertical or horizontal reference line, or one line per row when `data` is given. */
export type RuleMarkerConfig = {
	type: 'rule';
	axis: 'x' | 'y';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: AxisValue | string | ((d: any) => AxisValue);
	inset?: number;
	insetTop?: number;
	insetBottom?: number;
	insetLeft?: number;
	insetRight?: number;
	styles?: StrokeStyle;
} & CommonMarkerConfigWithInterval;
