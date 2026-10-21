import type { AxisValue } from '$lib/types/layout/mapping';
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
	/**
	 * A stroke color for each row - a field key or a function of the row - drawn
	 * as it is, not mapped through a color scale. Wins over `styles.stroke`.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	stroke?: string | ((d: any) => string | undefined);
	/** A stroke width for each row - a field key or a function of the row. Wins over `styles.strokeWidth`. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	strokeWidth?: string | ((d: any) => number);
	/** A stroke opacity for each row - a field key or a function of the row - drawn as it is. Wins over `styles.strokeOpacity`. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	strokeOpacity?: string | ((d: any) => number);
	styles?: StrokeStyle;
} & CommonMarkerConfigWithInterval;
