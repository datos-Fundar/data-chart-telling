import type { AreaStyle, DirectedInsetStyle, PerRow } from '$lib/types/plots/styling';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithArea } from '$lib/types/markers/channels/commonMarkerConfigWithArea';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Channel = AxisValue | ((d: any, context?: any) => AxisValue);

/**
 * A band per row that flows along x, from `x1` to `x2`: it leaves with its edges at `y1` and `y2` and arrives
 * with them at `y3` and `y4` (`y1` and `y2` again when unset). On a band axis it leaves from the far edge of
 * `x1`'s band and arrives at the near edge of `x2`'s, so it joins the bars on either side. Its `color` and
 * `opacity` channels fill the ribbons by a value of their rows, and name them on the plot's legend; unset, they
 * take the plot's own.
 */
export type RibbonMarkerConfig = {
	type: 'ribbon';
	x1?: Channel;
	x2?: Channel;
	y1?: Channel;
	y2?: Channel;
	y3?: Channel;
	y4?: Channel;
	/** How far in from each end (0-1) the edges' curves bend: `0.5` meets at the middle, `0` is a straight band. */
	curvature?: number;
	/** `insetStart`/`insetEnd` pull each end in by that many pixels along the flow. */
	styles?: PerRow<AreaStyle & DirectedInsetStyle>;
} & Omit<CommonMarkerConfigWithColor & CommonMarkerConfigWithArea, 'x' | 'y'>;
