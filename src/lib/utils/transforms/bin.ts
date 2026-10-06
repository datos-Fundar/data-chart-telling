import { binX, binY } from 'svelteplot';
import { BIN_X_CHANNEL_KEYS, BIN_Y_CHANNEL_KEYS } from '$lib/types/transforms/bin';
import type { MarkerTransform } from '$lib/types/transforms';
import type { Row, TransformAdapter } from './types';

/**
 * A numeric `interval` makes svelteplot start and stop its bins at the data's own
 * extremes, so the first and last bins come out cut short. Without an explicit
 * `domain`, this snaps the domain out to the interval's grid, so every bin is the
 * same width. Date intervals, and a `domain` the transform sets itself, are left alone.
 */
function alignBinToInterval(transform: MarkerTransform): MarkerTransform {
	if (transform.type !== 'binX' && transform.type !== 'binY') return transform;
	const { interval, domain, data } = transform as MarkerTransform & {
		interval?: unknown;
		domain?: unknown;
		data?: Row[];
	};
	if (typeof interval !== 'number' || domain !== undefined || !data) return transform;
	const binned = transform.type === 'binX' ? transform.x : transform.y;
	const read = typeof binned === 'function' ? binned : (d: Row) => (binned ? d[binned] : undefined);
	const values = data.map((d) => Number(read(d))).filter(Number.isFinite);
	if (!values.length) return transform;
	const lo = Math.floor(Math.min(...values) / interval) * interval;
	const hi = Math.ceil(Math.max(...values) / interval) * interval;
	return { ...transform, domain: [lo, hi] } as MarkerTransform;
}

/**
 * A `rect` a bin gave a value on one axis, with no far edge on that axis, draws a
 * bar from zero up to that value, the way svelteplot's `RectY`/`RectX` do. A bin's
 * count arrives as `y` (for `binX`) or `x` (for `binY`), so the bar's far end is
 * set here, once the transforms have run. A value with an edge already (a bin's own
 * `x1`/`x2`) is left alone, as is a `rect` with an `interval`, which svelteplot draws itself.
 */
function anchorBarToZero(marker: Row): Row {
	if (marker.type !== 'rect' || marker.interval !== undefined) return marker;
	const anchored = { ...marker };
	for (const [value, near, far] of [
		['y', 'y1', 'y2'],
		['x', 'x1', 'x2']
	] as const) {
		if (marker[value] === undefined || marker[far] !== undefined) continue;
		anchored[near] = marker[near] ?? 0;
		anchored[far] = marker[value];
	}
	return anchored;
}

export const binXAdapter: TransformAdapter = {
	channelKeys: BIN_X_CHANNEL_KEYS,
	run: binX as never,
	prepare: alignBinToInterval,
	finish: anchorBarToZero
};

export const binYAdapter: TransformAdapter = {
	channelKeys: BIN_Y_CHANNEL_KEYS,
	run: binY as never,
	prepare: alignBinToInterval,
	finish: anchorBarToZero
};
