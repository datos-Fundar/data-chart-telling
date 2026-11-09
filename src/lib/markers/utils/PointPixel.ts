import { BandNudge } from '$lib/markers/utils/BandNudge';
import type { BandSlice } from '$lib/types/layout/hover';

type Scale = { type?: string; fn?: (value: never) => unknown } | undefined;

/** Where a point is drawn, in pixels of its plot: its `x` and `y` through the plot's scales. */
export class PointPixel {
	/**
	 * `point`'s pixel position - the middle of its band on a band scale, of its slice when it has one (a grouped
	 * bar's series) - or `null` when a scale cannot place it.
	 */
	static of(
		scales: { x?: Scale; y?: Scale },
		point: { x: unknown; y: unknown; areaInset?: BandSlice }
	): { x: number; y: number } | null {
		const x = PointPixel.#along(scales.x, point.x);
		const y = PointPixel.#along(scales.y, point.y);
		if (x == null || y == null) return null;
		const nudge = BandNudge.of(scales, point.areaInset);
		return { x: x + nudge.dx, y: y + nudge.dy };
	}

	/** The index of the one of `points` nearest `cursor`, or `-1` when none can be placed. */
	static nearest(
		scales: { x?: Scale; y?: Scale },
		points: readonly { x: unknown; y: unknown; areaInset?: BandSlice }[],
		cursor: { x: number; y: number }
	): number {
		let best = -1;
		let bestDistance = Infinity;
		points.forEach((point, index) => {
			const pixel = PointPixel.of(scales, point);
			if (!pixel) return;
			const distance = Math.hypot(pixel.x - cursor.x, pixel.y - cursor.y);
			if (distance < bestDistance) {
				best = index;
				bestDistance = distance;
			}
		});
		return best;
	}

	/** `value`'s pixel along one scale, in the middle of its band on a band scale. */
	static #along(scale: Scale, value: unknown): number | null {
		if (!scale?.fn || value == null) return null;
		const raw = Number(scale.fn(value as never));
		if (!Number.isFinite(raw)) return null;
		if (scale.type !== 'band') return raw;
		const bandwidth = (scale.fn as { bandwidth?: () => number }).bandwidth?.() ?? 0;
		return raw + bandwidth / 2;
	}
}
