import { windowX, windowY, bollingerX, bollingerY } from 'svelteplot';
import { POSITION_CHANNEL_KEYS } from '$lib/types/transforms/common';
import { PerGroup } from '$lib/phases/transforms/methods/PerGroup';
import type { TransformAdapter } from '$lib/types/phases/transforms/adapter';

/** Sliding-window and Bollinger transforms, by axis. */
export class WindowTransform {
	static readonly windowX: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: windowX as never
	};

	static readonly windowY: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: windowY as never
	};

	// svelteplot's Bollinger bands run over every row at once, so they're run per group here.
	static readonly bollingerX: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: PerGroup.run(bollingerX as never)
	};

	static readonly bollingerY: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: PerGroup.run(bollingerY as never)
	};
}
