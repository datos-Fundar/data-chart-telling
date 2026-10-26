import { intervalX, intervalY, jitterX, jitterY, shiftX, shiftY } from 'svelteplot';
import { POSITION_CHANNEL_KEYS } from '$lib/types/transforms/common';
import { INTERVAL_CHANNEL_KEYS } from '$lib/types/transforms/interval';
import { AnchorBar } from '$lib/phases/transforms/methods/AnchorBar';
import { BandOffset } from '$lib/phases/transforms/methods/BandOffset';
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
		run: PositionTransform.#runJitter(jitterX, 'x')
	};

	static readonly jitterY: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: PositionTransform.#runJitter(jitterY, 'y')
	};

	static readonly shiftX: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: PositionTransform.#runShift(shiftX, 'x')
	};

	static readonly shiftY: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: PositionTransform.#runShift(shiftY, 'y')
	};

	/** Runs a jitter transform: through svelteplot on numbers and dates, across the band on categories. */
	static #runJitter(
		transform: typeof jitterX | typeof jitterY,
		axis: 'x' | 'y'
	): TransformAdapter['run'] {
		return (channels, options) => {
			if (BandOffset.isCategorical(channels.data as Row[], channels[axis])) {
				const source = PositionTransform.#source(options, axis);
				return BandOffset.add(channels, axis, BandOffset.noise(options, source));
			}
			return transform(
				channels as never,
				PositionTransform.#jitterOptions(options, axis) as never
			) as Row;
		};
	}

	/**
	 * Runs a shift transform: through svelteplot, which takes the amount itself as
	 * its second argument, or across the band by `by` bands on categories.
	 */
	static #runShift(
		transform: typeof shiftX | typeof shiftY,
		axis: 'x' | 'y'
	): TransformAdapter['run'] {
		return (channels, options) => {
			if (
				typeof options.by === 'number' &&
				BandOffset.isCategorical(channels.data as Row[], channels[axis])
			) {
				const by = options.by;
				return BandOffset.add(channels, axis, () => by);
			}
			return transform(channels as never, options.by as never) as Row;
		};
	}

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
		const source = PositionTransform.#source(options, axis);
		return distribution === 'normal'
			? { type: 'normal', std: options.std, source }
			: { type: 'uniform', width: options.width, source };
	}

	/** The jitter's own `source`, or a PRNG seeded by its `seed` or the axis' default one. */
	static #source(options: Row, axis: 'x' | 'y'): () => number {
		const defaultSeed =
			axis === 'x' ? PositionTransform.DEFAULT_SEED : PositionTransform.DEFAULT_SEED + 1;
		return (
			(options.source as (() => number) | undefined) ??
			PositionTransform.seededRandom((options.seed as number | undefined) ?? defaultSeed)
		);
	}
}
