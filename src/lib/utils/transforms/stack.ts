import { stackX, stackY, stackMosaicX, stackMosaicY } from 'svelteplot';
import { STACK_CHANNEL_KEYS, STACK_MOSAIC_CHANNEL_KEYS } from '$lib/types/transforms/stack';
import type { Row, TransformAdapter } from './types';

// No fixes: svelteplot's own output already carries each layer's `y1`/`y2` (or `x1`/`x2`).
export const stackYAdapter: TransformAdapter = {
	channelKeys: STACK_CHANNEL_KEYS,
	run: stackY as never
};

export const stackXAdapter: TransformAdapter = {
	channelKeys: STACK_CHANNEL_KEYS,
	run: stackX as never
};

/** The flat `percentX`/`percentY` back into svelteplot's nested `{ x: { percent }, y: { percent } }`. */
function mosaicOptions(options: Row) {
	return {
		x: { percent: options.percentX === true },
		y: { percent: options.percentY === true }
	};
}

export const stackMosaicXAdapter: TransformAdapter = {
	channelKeys: STACK_MOSAIC_CHANNEL_KEYS,
	run: (channels, options) => stackMosaicX(channels as never, mosaicOptions(options)) as Row
};

export const stackMosaicYAdapter: TransformAdapter = {
	channelKeys: STACK_MOSAIC_CHANNEL_KEYS,
	run: (channels, options) => stackMosaicY(channels as never, mosaicOptions(options)) as Row
};
