import type { StackXTransform, StackYTransform } from '$lib/types/transforms/stack';

export type { TransformChannel } from '$lib/types/transforms/common';
export type { StackXTransform, StackYTransform } from '$lib/types/transforms/stack';

/**
 * Every svelteplot transform a marker can run on its own rows before it draws,
 * via `CommonMarkerConfig.transforms`. Only the stack pair is wired so far —
 * the rest of svelteplot's transforms join this union as they're wired up.
 */
export type MarkerTransform = StackYTransform | StackXTransform;
