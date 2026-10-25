import type { AreaStyle } from '$lib/types/plots/styling';
import type { DensityKernel } from '$lib/types/transforms/density';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';

/**
 * A violin per category of its rows: their density estimate mirrored around the
 * middle of the category's band; a `box` marker over the same rows draws the box inside. `x` and `y` are the
 * category and the value, in either order.
 */
export type ViolinMarkerConfig = {
	type: 'violin';
	/** Kernel shape of the estimate. */
	kernel?: DensityKernel;
	/** Kernel bandwidth in data units; Silverman's rule picks one per violin when unset. */
	bandwidth?: number;
	/** Cuts each violin at its values' own extent. Defaults to `true`. */
	trim?: boolean;
	/** The density that reaches a violin's full width; each violin's own peak when unset. */
	peak?: number;
	/** The share of each band the violin takes, when several series sit side by side: its index among `count`. */
	slot?: { index: number; count: number };
	styles?: AreaStyle;
} & CommonMarkerConfig;
