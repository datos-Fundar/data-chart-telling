import type { AxisValue } from '$lib/types/layout/mapping';
import type { DotStyle, FontStyle, StrokeStyle } from '$lib/types/plots/styling';
import type { NumberDisplay } from '$lib/types/layout/numbers';

/** Which endpoint a delta measures from or to: a named series, or a fixed axis value. */
export type DeltaTarget = { type: 'series'; series: string } | { type: 'axis'; value?: number };

/**
 * Distance between two points on a line chart, along one axis. The distance reads as {@link NumberDisplay}
 * asks - `decimals` (default one), `prefix`, `suffix` and `signDisplay` - unless `formatDiff` writes it.
 */
export type DeltaConfig = NumberDisplay & {
	axis: 'x' | 'y';
	at: AxisValue;
	from: DeltaTarget;
	to?: DeltaTarget;
	/** The distance's text, in place of the number as the display fields above write it. */
	formatDiff?: (diff: number) => string;
	stroke?: StrokeStyle;
	text?: FontStyle;
	dot?: DotStyle;
};

/** One delta annotation, at one position, between two points on a line chart. */
export type DeltaPointConfig = {
	type: 'delta';
	xDomain?: (number | string | Date)[];
	yDomain?: (number | string | Date)[];
} & DeltaConfig;

/** A style as it is, or as a function of the position the delta is drawn at. */
export type PerPosition<T> = T | ((at: AxisValue) => T);

/**
 * A delta annotation between two points on a line chart. `at` can be a list of positions: one delta is
 * drawn at each, with the same ends. `stroke`, `text` and `dot` can be functions of the position, to style
 * each delta on its own - a label to the left of the last one, say, so it stays inside the plot.
 */
export type DeltaMarkerConfig = Omit<DeltaPointConfig, 'at' | 'stroke' | 'text' | 'dot'> & {
	at: AxisValue | AxisValue[];
	stroke?: PerPosition<StrokeStyle>;
	text?: PerPosition<FontStyle>;
	dot?: PerPosition<DotStyle>;
};
