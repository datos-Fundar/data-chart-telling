import { sort, shuffle, reverse, filter, select } from 'svelteplot';
import { POSITION_CHANNEL_KEYS } from '$lib/types/transforms/common';
import { SORT_CHANNEL_KEYS } from '$lib/types/transforms/sort';
import { FILTER_CHANNEL_KEYS } from '$lib/types/transforms/filter';
import { PositionTransform } from '$lib/phases/transforms/methods/PositionTransform';
import type { Row, TransformAdapter } from '$lib/types/phases/transforms/adapter';

/** Transforms that choose and order rows: sort, shuffle, reverse, filter and select. */
export class OrderTransform {
	static readonly sort: TransformAdapter = {
		channelKeys: SORT_CHANNEL_KEYS,
		run: sort as never
	};

	static readonly shuffle: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: (channels, options) =>
			shuffle(channels as never, {
				seed: (options.seed as number | undefined) ?? PositionTransform.DEFAULT_SEED
			}) as Row
	};

	static readonly reverse: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: (channels) => reverse(channels as never) as Row
	};

	static readonly filter: TransformAdapter = {
		channelKeys: FILTER_CHANNEL_KEYS,
		run: (channels) => filter(channels as never) as Row
	};

	static readonly select: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: (channels, options) => select(channels as never, options.select as never) as Row
	};

	static readonly first = OrderTransform.#selectBy('first');
	static readonly last = OrderTransform.#selectBy('last');
	static readonly minX = OrderTransform.#selectBy({ x: 'min' });
	static readonly maxX = OrderTransform.#selectBy({ x: 'max' });
	static readonly minY = OrderTransform.#selectBy({ y: 'min' });
	static readonly maxY = OrderTransform.#selectBy({ y: 'max' });

	/** A `select` with what it keeps fixed: the shorthands `selectFirst`, `selectMaxY`, ... */
	static #selectBy(by: unknown): TransformAdapter {
		return {
			channelKeys: POSITION_CHANNEL_KEYS,
			run: (channels) => select(channels as never, by as never) as Row
		};
	}
}
