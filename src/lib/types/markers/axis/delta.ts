import type { AxisValue } from '$lib/types/layout/scales';
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

/** A delta annotation between two points on a line chart. */
export type DeltaMarkerConfig = {
	type: 'delta';
	xDomain?: (number | string | Date)[];
	yDomain?: (number | string | Date)[];
} & DeltaConfig;
