import type { BandSlice } from '$lib/types/layout/hover';

type BandScale = { type?: string; fn?: unknown } | undefined;

/**
 * How far a mark sits off the middle of its category band, in pixels, when it
 * belongs to one `slice` of the band (a grouped bar's series). Vertical bars
 * slice their band along `x`, horizontal ones along `y`, from the bottom; the
 * band is read at its drawn width.
 */
export class BandNudge {
	static of(
		scales: { x?: BandScale; y?: BandScale },
		slice: BandSlice | undefined
	): { dx: number; dy: number } {
		if (!slice) return { dx: 0, dy: 0 };
		const across = (slice.start - slice.end) / 2;
		const bandX = BandNudge.#width(scales.x);
		return bandX > 0
			? { dx: across * bandX, dy: 0 }
			: { dx: 0, dy: -across * BandNudge.#width(scales.y) };
	}

	/** A band scale's drawn band width; `0` for any other scale. */
	static #width(scale: BandScale): number {
		return scale?.type === 'band'
			? ((scale.fn as { bandwidth?: () => number }).bandwidth?.() ?? 0)
			: 0;
	}
}
