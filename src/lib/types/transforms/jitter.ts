import type { PositionChannels } from '$lib/types/transforms/common';

/**
 * Options both jitter transforms take. svelteplot names the distribution
 * `type`, which here picks the transform, so it's `distribution` instead.
 */
type JitterOptions = {
	/** Draws the noise from a uniform or a normal distribution; defaults to `uniform`. */
	distribution?: 'uniform' | 'normal';
	/** Half-width of the uniform noise, in data units (or a duration like `'3 days'`); defaults to 0.35. */
	width?: number | string;
	/** Standard deviation of the normal noise, in data units; defaults to 0.15. */
	std?: number | string;
	/**
	 * Seeds the noise, so every render draws the same offsets; a fixed seed (a
	 * different one per axis) is used when unset. Change it for a different,
	 * equally stable draw.
	 */
	seed?: number;
	/** Your own source of random numbers in [0, 1); takes over from `seed`. */
	source?: () => number;
};

/**
 * `jitterX` as a marker transform: nudges each row's `x` by a small random
 * amount, so points that share a value spread out instead of hiding each other.
 * Only numbers and dates are nudged.
 */
export type JitterXTransform = { type: 'jitterX' } & PositionChannels & JitterOptions;

/** `jitterY` — see {@link JitterXTransform}, on `y`. */
export type JitterYTransform = { type: 'jitterY' } & PositionChannels & JitterOptions;
