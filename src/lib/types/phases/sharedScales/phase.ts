import type { AxisChannelName } from '$lib/types/layout/mapping';

/** Every value one slice places on each axis, and how its kind lays those axes out. */
export type SharedAxisValues = {
	x: unknown[];
	y: unknown[];
	/** Axes laid out as bands (categories). */
	band: AxisChannelName[];
	/** Axes whose domain must include zero. */
	zero: AxisChannelName[];
	/** Whether its bands keep the order the data gives them, instead of sorting. */
	dataOrder?: boolean;
};
