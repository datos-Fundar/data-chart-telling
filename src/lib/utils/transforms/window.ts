import { windowX, windowY, bollingerX, bollingerY } from 'svelteplot';
import { POSITION_CHANNEL_KEYS } from '$lib/types/transforms/common';
import { perGroup } from './perGroup';
import type { TransformAdapter } from './types';

export const windowXAdapter: TransformAdapter = {
	channelKeys: POSITION_CHANNEL_KEYS,
	run: windowX as never
};

export const windowYAdapter: TransformAdapter = {
	channelKeys: POSITION_CHANNEL_KEYS,
	run: windowY as never
};

// svelteplot's Bollinger bands run over every row at once, so they're run per group here.
export const bollingerXAdapter: TransformAdapter = {
	channelKeys: POSITION_CHANNEL_KEYS,
	run: perGroup(bollingerX as never)
};

export const bollingerYAdapter: TransformAdapter = {
	channelKeys: POSITION_CHANNEL_KEYS,
	run: perGroup(bollingerY as never)
};
