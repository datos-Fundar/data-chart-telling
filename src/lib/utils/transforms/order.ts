import { sort, shuffle, reverse, filter, select } from 'svelteplot';
import { POSITION_CHANNEL_KEYS } from '$lib/types/transforms/common';
import { SORT_CHANNEL_KEYS } from '$lib/types/transforms/sort';
import { FILTER_CHANNEL_KEYS } from '$lib/types/transforms/filter';
import { DEFAULT_SEED } from './position';
import type { Row, TransformAdapter } from './types';

export const sortAdapter: TransformAdapter = {
	channelKeys: SORT_CHANNEL_KEYS,
	run: sort as never
};

export const shuffleAdapter: TransformAdapter = {
	channelKeys: POSITION_CHANNEL_KEYS,
	run: (channels, options) =>
		shuffle(channels as never, {
			seed: (options.seed as number | undefined) ?? DEFAULT_SEED
		}) as Row
};

export const reverseAdapter: TransformAdapter = {
	channelKeys: POSITION_CHANNEL_KEYS,
	run: (channels) => reverse(channels as never) as Row
};

export const filterAdapter: TransformAdapter = {
	channelKeys: FILTER_CHANNEL_KEYS,
	run: (channels) => filter(channels as never) as Row
};

/** A `select` with what it keeps fixed: the shorthands `selectFirst`, `selectMaxY`, … */
function selectBy(by: unknown): TransformAdapter {
	return {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: (channels) => select(channels as never, by as never) as Row
	};
}

export const selectAdapter: TransformAdapter = {
	channelKeys: POSITION_CHANNEL_KEYS,
	run: (channels, options) => select(channels as never, options.select as never) as Row
};

export const selectFirstAdapter = selectBy('first');
export const selectLastAdapter = selectBy('last');
export const selectMinXAdapter = selectBy({ x: 'min' });
export const selectMaxXAdapter = selectBy({ x: 'max' });
export const selectMinYAdapter = selectBy({ y: 'min' });
export const selectMaxYAdapter = selectBy({ y: 'max' });
