import type { ValueLabels } from '$lib/layout/styles/ValueLabels';
import type { AxisBasedMarkersConfig, TextMarkerConfig } from '$lib/types/markers/common';

/** What a plot kind adds to the shared "markers" stage. */
export type MarkersStageOptions<TState, TCtx> = {
	/** The plot's own marks - its bars, lines, dots... - drawn under every other marker. */
	marks: (state: TState, ctx: TCtx) => AxisBasedMarkersConfig[];
	/**
	 * Its value labels, once they show: `text` markers drawn over everything.
	 * The stage adds what every label shares - see {@link ValueLabels.hooks}.
	 * Without it, the plot draws none.
	 */
	valueLabels?: (labels: ValueLabels, state: TState, ctx: TCtx) => TextMarkerConfig[];
};
