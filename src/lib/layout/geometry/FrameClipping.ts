import { MarkerKinds } from '$lib/markers/MarkerKinds';
import type { MarkerConfig } from '$lib/types/markers/all';

/**
 * How marks are clipped to the plot's frame. Which markers are clipped is
 * per kind (`MarkerKinds`), with a marker's own `clip` overriding it, and a clipped mark may
 * reach `top`/`right`/`bottom`/`left` px past the frame before it's cut
 * (from `frameClip.tolerance`).
 */
export class FrameClipping {
	constructor(
		readonly top: number,
		readonly right: number,
		readonly bottom: number,
		readonly left: number
	) {}

	/**
	 * Parses a tolerance: a number for all four sides, or CSS shorthand px
	 * values for 1-4 of them. Throws on anything else, so a bad config fails loudly.
	 */
	static parse(tolerance: number | string): FrameClipping {
		const tokens =
			typeof tolerance === 'number' ? [String(tolerance)] : tolerance.trim().split(/\s+/);
		if (tokens.length < 1 || tokens.length > 4) {
			throw new Error(`frameClip.tolerance takes 1-4 values, got "${tolerance}"`);
		}
		const [top, right = top, bottom = top, left = right] = tokens.map((token) => {
			const match = /^(\d+(?:\.\d+)?|\.\d+)(px)?$/.exec(token);
			if (!match) throw new Error(`frameClip.tolerance must be non-negative px, got "${token}"`);
			return Number(match[1]);
		});
		return new FrameClipping(top, right, bottom, left);
	}

	/** Whether `marker` is clipped: its own `clip` when set, otherwise its kind's default. */
	static isClipped(marker: { type: MarkerConfig['type']; clip?: unknown }): boolean {
		return (marker.clip ?? MarkerKinds.of(marker.type)?.clip) === true;
	}
}
