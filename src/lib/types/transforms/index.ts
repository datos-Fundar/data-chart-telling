import type { StackXTransform, StackYTransform } from '$lib/types/transforms/stack';
import type { BinXTransform, BinYTransform } from '$lib/types/transforms/bin';

export type { TransformChannel } from '$lib/types/transforms/common';
export type { StackXTransform, StackYTransform } from '$lib/types/transforms/stack';
export type { BinXTransform, BinYTransform } from '$lib/types/transforms/bin';

/**
 * Every svelteplot transform a marker can run on its own rows before it draws,
 * via `CommonMarkerConfig.transforms`. The stack and bin pairs are wired so
 * far — the rest of svelteplot's transforms join this union as they're wired up.
 */
export type MarkerTransform = StackYTransform | StackXTransform | BinXTransform | BinYTransform;
