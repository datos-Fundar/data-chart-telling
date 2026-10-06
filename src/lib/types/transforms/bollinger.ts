import type { PositionChannels } from '$lib/types/transforms/common';

/** Options both Bollinger transforms take — same names as svelteplot's. */
type BollingerOptions = {
	/** The moving window's size, in rows; defaults to 20. */
	n?: number;
	/** The band's radius, in standard deviations; defaults to 2. */
	k?: number;
};

/**
 * `bollingerY` as a marker transform: a moving mean of `y` over `n` rows with a
 * band `k` standard deviations around it — the mean as `y`, the band as
 * `y1`/`y2`. A `line` draws the mean, an `area` the band. Runs per `z` group.
 */
export type BollingerYTransform = { type: 'bollingerY' } & PositionChannels & BollingerOptions;

/** `bollingerX` — see {@link BollingerYTransform}, on `x`. */
export type BollingerXTransform = { type: 'bollingerX' } & PositionChannels & BollingerOptions;
