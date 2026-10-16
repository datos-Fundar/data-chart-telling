import { intervalX, intervalY, jitterX, jitterY, shiftX, shiftY } from 'svelteplot';
import { POSITION_CHANNEL_KEYS } from '$lib/types/transforms/common';
import { INTERVAL_CHANNEL_KEYS } from '$lib/types/transforms/interval';
import { AnchorBar } from '$lib/phases/transforms/methods/AnchorBar';
import type { Row, TransformAdapter } from '$lib/types/phases/transforms/adapter';

/** Interval, jitter and shift transforms, by axis. */
export class PositionTransform {
	/** The seed a random transform uses when none is given, so it draws the same way on every render. */
	static readonly DEFAULT_SEED = 42;

	/** A small seeded PRNG (mulberry32): the same seed always yields the same sequence in [0, 1). */
	static seededRandom(seed: number): () => number {
		let state = seed | 0;
		return () => {
			state = (state + 0x6d2b79f5) | 0;
			let t = Math.imul(state ^ (state >>> 15), 1 | state);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	static readonly intervalX: TransformAdapter = {
		channelKeys: INTERVAL_CHANNEL_KEYS,
		run: PositionTransform.#runInterval(intervalX),
		finish: AnchorBar.toZero('y')
	};

	static readonly intervalY: TransformAdapter = {
		channelKeys: INTERVAL_CHANNEL_KEYS,
		run: PositionTransform.#runInterval(intervalY),
		finish: AnchorBar.toZero('x')
	};

	static readonly jitterX: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: (channels, options) =>
			jitterX(channels as never, PositionTransform.#jitterOptions(options, 'x') as never) as Row
	};

	static readonly jitterY: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: (channels, options) =>
			jitterY(channels as never, PositionTransform.#jitterOptions(options, 'y') as never) as Row
	};

	// svelteplot takes the amount itself as the second argument, not an options object.
	static readonly shiftX: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: (channels, options) => shiftX(channels as never, options.by as never) as Row
	};

	static readonly shiftY: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: (channels, options) => shiftY(channels as never, options.by as never) as Row
	};

	/**
	 * Runs an interval transform. svelteplot reads `interval` next to the channels,
	 * in a single argument, and hands it back with them; it's dropped from the
	 * output, since on a `rect` it would read as the rect's own `interval` and
	 * widen the already-widened edges again.
	 */
	static #runInterval(transform: typeof intervalX): TransformAdapter['run'] {
		return (channels) => {
			const out = { ...(transform(channels as never) as Row) };
			delete out.interval;
			return out;
		};
	}

	/**
	 * The flat jitter options back into svelteplot's own: `distribution` is its
	 * `type`, and the noise is seeded unless a `source` is given. Each axis has its
	 * own default seed: with the same one, `jitterX` and `jitterY` would draw the
	 * same offsets and move every point along a diagonal.
	 */
	static #jitterOptions(options: Row, axis: 'x' | 'y') {
		const distribution = (options.distribution as string | undefined) ?? 'uniform';
		const defaultSeed =
			axis === 'x' ? PositionTransform.DEFAULT_SEED : PositionTransform.DEFAULT_SEED + 1;
		const source =
			(options.source as (() => number) | undefined) ??
			PositionTransform.seededRandom((options.seed as number | undefined) ?? defaultSeed);
		return distribution === 'normal'
			? { type: 'normal', std: options.std, source }
			: { type: 'uniform', width: options.width, source };
	}
}
