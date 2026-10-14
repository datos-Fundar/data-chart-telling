import { bin, binX, binY } from 'svelteplot';
import {
	BIN_X_CHANNEL_KEYS,
	BIN_Y_CHANNEL_KEYS,
	BIN_2D_CHANNEL_KEYS
} from '$lib/types/transforms/bin';
import { AnchorBar } from '$lib/phases/transforms/methods/AnchorBar';
import type { Row, TransformAdapter, TransformArgs } from '$lib/types/phases/transforms/adapter';

/**
 * A numeric `interval` makes svelteplot start and stop its bins at the data's own
 * extremes, so the first and last bins come out cut short. Without an explicit
 * `domain`, this snaps the domain out to the interval's grid, so every bin is the
 * same width. Date intervals, and a `domain` the transform sets itself, are left alone.
 */
function alignBinToInterval(dim: 'x' | 'y') {
	return ({ channels, options }: TransformArgs): TransformArgs => {
		const { interval, domain } = options;
		const data = channels.data as Row[] | undefined;
		if (typeof interval !== 'number' || domain !== undefined || !data) {
			return { channels, options };
		}
		const binned = channels[dim];
		const read =
			typeof binned === 'function'
				? (binned as (d: Row) => unknown)
				: (d: Row) => (binned ? d[binned as string] : undefined);
		const values = data.map((d) => Number(read(d))).filter(Number.isFinite);
		if (!values.length) return { channels, options };
		const lo = Math.floor(Math.min(...values) / interval) * interval;
		const hi = Math.ceil(Math.max(...values) / interval) * interval;
		return { channels, options: { ...options, domain: [lo, hi] } };
	};
}

/** svelteplot's bin transforms: along `x`, along `y`, or both. */
export class BinTransform {
	static readonly x: TransformAdapter = {
		channelKeys: BIN_X_CHANNEL_KEYS,
		run: binX as never,
		prepare: alignBinToInterval('x'),
		finish: AnchorBar.toZero('y')
	};

	static readonly y: TransformAdapter = {
		channelKeys: BIN_Y_CHANNEL_KEYS,
		run: binY as never,
		prepare: alignBinToInterval('y'),
		finish: AnchorBar.toZero('x')
	};

	// Bins on both axes: every cell already has both edges, so no bar to anchor.
	static readonly grid: TransformAdapter = {
		channelKeys: BIN_2D_CHANNEL_KEYS,
		run: bin as never
	};
}
