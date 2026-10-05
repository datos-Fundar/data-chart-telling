import type { AreaStyle } from '$lib/types/plots/styling';

/** Kernel shapes svelteplot's own `densityX` transform supports. */
export type DensityKernel =
	| 'uniform'
	| 'triangular'
	| 'epanechnikov'
	| 'quartic'
	| 'triweight'
	| 'gaussian'
	| 'cosine';

/**
 * Options for `type: 'density'` — a 1D kernel density estimate over the
 * `x` values, drawn as a filled area. Mirrors svelteplot's own `densityX`
 * transform (same option names); the curve's own `y` is the density.
 */
export type DensityStatisticOptions = {
	kernel?: DensityKernel;
	/** Kernel bandwidth in data units; svelteplot picks one from the data when unset. */
	bandwidth?: number;
	styles?: AreaStyle;
};

/**
 * Options for `type: 'density2d'` — 2D contour bands, same options as the
 * `density` marker (svelteplot's own `Density` mark). Set `thresholds` to
 * control the number of bands or give the density levels explicitly.
 */
export type Density2DStatisticOptions = {
	/** Gaussian kernel bandwidth in pixels — svelteplot defaults to 20. */
	bandwidth?: number;
	/** Contour level count, or an explicit list of density thresholds. */
	thresholds?: number | number[];
	styles?: AreaStyle;
};
