import type { AxisValue } from '$lib/types/layout/scales';

/**
 * A channel a transform reads: a field key, or a per-row function — the same
 * shape every marker's own `x`/`y` takes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TransformChannel = string | ((d: any) => AxisValue | unknown);
