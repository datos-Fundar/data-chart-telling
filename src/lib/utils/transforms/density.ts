import { densityX, densityY } from 'svelteplot';
import { DENSITY_CHANNEL_KEYS } from '$lib/types/transforms/density';
import type { TransformAdapter } from './types';

export const densityXAdapter: TransformAdapter = {
	channelKeys: DENSITY_CHANNEL_KEYS,
	run: densityX as never
};

export const densityYAdapter: TransformAdapter = {
	channelKeys: DENSITY_CHANNEL_KEYS,
	run: densityY as never
};
