import type { AxisBasedStylesConfig } from '$lib/types/layout/styles/base';

/**
 * `styles` of the graph kinds: the shared axis-based fields, plus `arrangement`, the options of how the kind
 * places its rows (a treemap's `tile`).
 */
export type ArrangementAwarePlotStylesConfig<TOptions extends object> = AxisBasedStylesConfig & {
	arrangement?: TOptions;
};
