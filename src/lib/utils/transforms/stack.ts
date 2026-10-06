import { stackX, stackY } from 'svelteplot';
import { STACK_CHANNEL_KEYS } from '$lib/types/transforms/stack';
import type { TransformAdapter } from './types';

// No fixes: svelteplot's own output already carries each layer's `y1`/`y2` (or `x1`/`x2`).
export const stackYAdapter: TransformAdapter = {
	channelKeys: STACK_CHANNEL_KEYS,
	run: stackY as never
};

export const stackXAdapter: TransformAdapter = {
	channelKeys: STACK_CHANNEL_KEYS,
	run: stackX as never
};
