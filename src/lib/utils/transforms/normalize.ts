import {
	normalizeX,
	normalizeY,
	normalizeParallelX,
	normalizeParallelY,
	mapX,
	mapY
} from 'svelteplot';
import { POSITION_CHANNEL_KEYS } from '$lib/types/transforms/common';
import type { TransformAdapter } from './types';

export const normalizeXAdapter: TransformAdapter = {
	channelKeys: POSITION_CHANNEL_KEYS,
	run: normalizeX as never
};

export const normalizeYAdapter: TransformAdapter = {
	channelKeys: POSITION_CHANNEL_KEYS,
	run: normalizeY as never
};

export const normalizeParallelXAdapter: TransformAdapter = {
	channelKeys: POSITION_CHANNEL_KEYS,
	run: normalizeParallelX as never
};

export const normalizeParallelYAdapter: TransformAdapter = {
	channelKeys: POSITION_CHANNEL_KEYS,
	run: normalizeParallelY as never
};

// svelteplot takes the mapping itself as the second argument, not an options object.
export const mapXAdapter: TransformAdapter = {
	channelKeys: POSITION_CHANNEL_KEYS,
	run: (channels, options) => mapX(channels as never, options.map as never)
};

export const mapYAdapter: TransformAdapter = {
	channelKeys: POSITION_CHANNEL_KEYS,
	run: (channels, options) => mapY(channels as never, options.map as never)
};
