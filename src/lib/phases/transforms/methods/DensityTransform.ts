import { densityX, densityY } from 'svelteplot';
import { DENSITY_CHANNEL_KEYS } from '$lib/types/transforms/density';
import type { TransformAdapter } from '$lib/types/phases/transforms/adapter';

/** svelteplot's density transforms, by axis. */
export class DensityTransform {
	static readonly x: TransformAdapter = {
		channelKeys: DENSITY_CHANNEL_KEYS,
		run: densityX as never
	};

	static readonly y: TransformAdapter = {
		channelKeys: DENSITY_CHANNEL_KEYS,
		run: densityY as never
	};
}
