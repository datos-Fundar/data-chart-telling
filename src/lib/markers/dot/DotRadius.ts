import type { BoxScales } from '$lib/types/markers/labels/box';

type Dotted = { r?: unknown; styles?: object };

const read = (channel: unknown, row: unknown): unknown =>
	typeof channel === 'function'
		? (channel as (row: unknown) => unknown)(row)
		: typeof channel === 'string' || typeof channel === 'symbol'
			? (row as Record<string | symbol, unknown>)?.[channel]
			: channel;

/** A dot's radius in pixels, as its marker draws it. */
export class DotRadius {
	/** Its `r`: a number as it is, a channel through the plot's `r` scale; else its `dotRadius`, else `fallback`. */
	static of(marker: Dotted, row: unknown, scales: BoxScales, fallback = 5): number {
		const { r } = marker;
		if (typeof r === 'number') return r;
		if (r !== undefined && scales.r) {
			const value = Number(scales.r.fn(read(r, row)));
			if (Number.isFinite(value)) return value;
		}
		const own = (marker.styles as { dotRadius?: unknown } | undefined)?.dotRadius;
		return typeof own === 'number' ? own : fallback;
	}
}
