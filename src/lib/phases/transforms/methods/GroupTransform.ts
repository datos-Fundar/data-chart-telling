import { group, groupX, groupY, groupZ } from 'svelteplot';
import { GROUP_CHANNEL_KEYS } from '$lib/types/transforms/group';
import { AnchorBar } from '$lib/phases/transforms/methods/AnchorBar';
import type { TransformAdapter } from '$lib/types/phases/transforms/adapter';

/** The style outputs every group transform can reduce to. */
const STYLE_OUTPUTS = {
	fill: true,
	stroke: true,
	r: true,
	opacity: true,
	fillOpacity: true,
	strokeOpacity: true
} as const;

/** svelteplot's group transforms: along `x`, along `y`, by `z`, or both axes. */
export class GroupTransform {
	// Each group transform's position outputs are reducers on the transform, while
	// the marker's own channel of the same name stays the value they reduce.
	static readonly x: TransformAdapter = {
		channelKeys: GROUP_CHANNEL_KEYS,
		outputKeys: { y: true, y1: true, y2: true, ...STYLE_OUTPUTS },
		run: groupX as never,
		finish: AnchorBar.toZero('y')
	};

	static readonly y: TransformAdapter = {
		channelKeys: GROUP_CHANNEL_KEYS,
		outputKeys: { x: true, x1: true, x2: true, ...STYLE_OUTPUTS },
		run: groupY as never,
		finish: AnchorBar.toZero('x')
	};

	static readonly z: TransformAdapter = {
		channelKeys: GROUP_CHANNEL_KEYS,
		outputKeys: { x: true, x1: true, x2: true, y: true, y1: true, y2: true, ...STYLE_OUTPUTS },
		run: groupZ as never
	};

	static readonly grid: TransformAdapter = {
		channelKeys: GROUP_CHANNEL_KEYS,
		outputKeys: STYLE_OUTPUTS,
		run: group as never
	};
}
