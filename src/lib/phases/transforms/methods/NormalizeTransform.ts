import {
	normalizeX,
	normalizeY,
	normalizeParallelX,
	normalizeParallelY,
	mapX,
	mapY
} from 'svelteplot';
import { POSITION_CHANNEL_KEYS } from '$lib/types/transforms/common';
import type { TransformAdapter } from '$lib/types/phases/transforms/adapter';

/** Normalize and map transforms, by axis. */
export class NormalizeTransform {
	static readonly x: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: normalizeX as never
	};

	static readonly y: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: normalizeY as never
	};

	static readonly parallelX: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: normalizeParallelX as never
	};

	static readonly parallelY: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: normalizeParallelY as never
	};

	// svelteplot takes the mapping itself as the second argument, not an options object.
	static readonly mapX: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: (channels, options) => mapX(channels as never, options.map as never)
	};

	static readonly mapY: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: (channels, options) => mapY(channels as never, options.map as never)
	};
}
