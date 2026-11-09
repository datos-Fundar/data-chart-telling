import type { ValueLabels } from '$lib/layout/styles/ValueLabels';
import type { AxisBasedMarkersConfig, TextMarkerConfig } from '$lib/types/markers/common';

/** What a plot kind adds to the shared "markers" stage. */
export type MarkersStageOptions<TState, TEnv> = {
	/** The plot's own marks - its bars, lines, dots... - drawn under every other marker. */
	marks: (state: TState, env: TEnv) => AxisBasedMarkersConfig[];
	/**
	 * Its value labels, once they show: `text` markers drawn over everything.
	 * The stage adds what every label shares - see {@link ValueLabels.hooks}.
	 * Without it, the plot draws none.
	 */
	valueLabels?: (labels: ValueLabels, state: TState, env: TEnv) => TextMarkerConfig[];
};
