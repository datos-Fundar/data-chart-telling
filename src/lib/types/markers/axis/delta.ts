import type { AxisValue } from '$lib/types/layout/mapping';
import type { DotStyle, FontStyle, StrokeStyle } from '$lib/types/plots/styling';

/** Which endpoint a delta measures from or to: a named series, or a fixed axis value. */
export type DeltaTarget = { type: 'series'; series: string } | { type: 'axis'; value?: number };

/** Distance between two points on a line chart, along one axis. */
export type DeltaConfig = {
	axis: 'x' | 'y';
	at: AxisValue;
	from: DeltaTarget;
	to?: DeltaTarget;
	formatDiff?: (diff: number) => string;
	line?: StrokeStyle;
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
 * drawn at each, with the same ends. `line`, `text` and `dot` can be functions of the position, to style
 * each delta on its own - a label to the left of the last one, say, so it stays inside the plot.
 */
export type DeltaMarkerConfig = Omit<DeltaPointConfig, 'at' | 'line' | 'text' | 'dot'> & {
	at: AxisValue | AxisValue[];
	line?: PerPosition<StrokeStyle>;
	text?: PerPosition<FontStyle>;
	dot?: PerPosition<DotStyle>;
};
