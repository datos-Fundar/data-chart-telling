import { group, groupX, groupY, groupZ } from 'svelteplot';
import { GROUP_CHANNEL_KEYS } from '$lib/types/transforms/group';
import { anchorBarToZero } from './anchor';
import type { TransformAdapter } from './types';

/** The style outputs every group transform can reduce to. */
const STYLE_OUTPUTS = {
	fill: true,
	stroke: true,
	r: true,
	opacity: true,
	fillOpacity: true,
	strokeOpacity: true
} as const;

// Each group transform's position outputs are reducers on the transform, while
// the marker's own channel of the same name stays the value they reduce.
export const groupXAdapter: TransformAdapter = {
	channelKeys: GROUP_CHANNEL_KEYS,
	outputKeys: { y: true, y1: true, y2: true, ...STYLE_OUTPUTS },
	run: groupX as never,
	finish: anchorBarToZero('y')
};

export const groupYAdapter: TransformAdapter = {
	channelKeys: GROUP_CHANNEL_KEYS,
	outputKeys: { x: true, x1: true, x2: true, ...STYLE_OUTPUTS },
	run: groupY as never,
	finish: anchorBarToZero('x')
};

export const groupZAdapter: TransformAdapter = {
	channelKeys: GROUP_CHANNEL_KEYS,
	outputKeys: { x: true, x1: true, x2: true, y: true, y1: true, y2: true, ...STYLE_OUTPUTS },
	run: groupZ as never
};

export const group2DAdapter: TransformAdapter = {
	channelKeys: GROUP_CHANNEL_KEYS,
	outputKeys: STYLE_OUTPUTS,
	run: group as never
};
