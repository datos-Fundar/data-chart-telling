import { stackX, stackY, stackMosaicX, stackMosaicY } from 'svelteplot';
import { STACK_CHANNEL_KEYS, STACK_MOSAIC_CHANNEL_KEYS } from '$lib/types/transforms/stack';
import type { Row, TransformAdapter } from '$lib/types/phases/transforms/adapter';

/** The flat `percentX`/`percentY` back into svelteplot's nested `{ x: { percent }, y: { percent } }`. */
function mosaicOptions(options: Row) {
	return {
		x: { percent: options.percentX === true },
		y: { percent: options.percentY === true }
	};
}

/** svelteplot's stack transforms, by axis. */
export class StackTransform {
	// No fixes: svelteplot's own output already carries each layer's `y1`/`y2` (or `x1`/`x2`).
	static readonly y: TransformAdapter = {
		channelKeys: STACK_CHANNEL_KEYS,
		run: stackY as never
	};

	static readonly x: TransformAdapter = {
		channelKeys: STACK_CHANNEL_KEYS,
		run: stackX as never
	};

	static readonly mosaicX: TransformAdapter = {
		channelKeys: STACK_MOSAIC_CHANNEL_KEYS,
		run: (channels, options) => stackMosaicX(channels as never, mosaicOptions(options)) as Row
	};

	static readonly mosaicY: TransformAdapter = {
		channelKeys: STACK_MOSAIC_CHANNEL_KEYS,
		run: (channels, options) => stackMosaicY(channels as never, mosaicOptions(options)) as Row
	};
}
