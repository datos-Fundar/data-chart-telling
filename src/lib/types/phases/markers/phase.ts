import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

/** What a plot kind adds to the shared "markers" stage. */
export type MarkersStageOptions<TState, TEnv> = {
	/** The plot's own marks - its bars, lines, dots... - drawn under every other marker. */
	marks: (state: TState, env: TEnv) => AxisBasedMarkersConfig[];
};
