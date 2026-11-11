import { MarkerKinds } from '$lib/markers/MarkerKinds';
import type { InheritedChannel } from '$lib/types/markers/traits';

type Marker = { type: string } & Record<string, unknown>;

/** The value channels a marker takes as they are; `grouping` and `color` are `MarkerGrouping`'s. */
const VALUES = ['opacity', 'symbol', 'r', 'length'] as const satisfies InheritedChannel[];

/** How a plot's position and value channels reach the markers its author adds. */
export class MarkerInheritance {
	/**
	 * `marker` with the plot's `x`/`y` on each axis it sets no position for (`x`, `x1` or `x2`...), and the
	 * plot's other channels it sets none of, as far as its kind inherits them.
	 */
	static inherit<T extends { type: string }>(
		marker: T,
		plot: Partial<Record<InheritedChannel, unknown>>
	): T {
		const own = marker as T & Marker;
		const takes = (channel: InheritedChannel) =>
			plot[channel] !== undefined && MarkerKinds.inherits(own.type, channel);
		const taken: Record<string, unknown> = {};
		for (const axis of ['x', 'y'] as const) {
			const unset = [axis, `${axis}1`, `${axis}2`].every((key) => own[key] === undefined);
			if (unset && takes(axis)) taken[axis] = plot[axis];
		}
		for (const channel of VALUES) {
			if (own[channel] === undefined && takes(channel)) taken[channel] = plot[channel];
		}
		return Object.keys(taken).length ? { ...own, ...taken } : marker;
	}
}
