import type { TransformChannel } from '$lib/types/transforms/common';

/** Kernel shapes svelteplot's own density transforms support. */
export type DensityKernel =
	| 'uniform'
	| 'triangular'
	| 'epanechnikov'
	| 'quartic'
	| 'triweight'
	| 'gaussian'
	| 'cosine';

/** Channels both density transforms read; `weight` gives each row its share of the estimate. */
type DensityChannels = {
	data?: Record<string, unknown>[];
	x?: TransformChannel;
	y?: TransformChannel;
	z?: TransformChannel;
	fill?: TransformChannel;
	stroke?: TransformChannel;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	weight?: (d: any) => number;
};

/** The keys of the density transforms' channels, at runtime. */
export const DENSITY_CHANNEL_KEYS: Record<keyof DensityChannels, true> = {
	data: true,
	x: true,
	y: true,
	z: true,
	fill: true,
	stroke: true,
	weight: true
};

/** Options both density transforms take, flat next to the channels - same names as svelteplot's. */
type DensityOptions = {
	/** The kernel's shape, or a kernel function of `u`; defaults to `epanechnikov`. */
	kernel?: DensityKernel | ((u: number) => number);
	/** Kernel bandwidth in data units, or a function of the sorted values; defaults to Silverman's rule. */
	bandwidth?: number | ((values: number[]) => number);
	/** The spacing of the points the estimate is sampled at; defaults to a fifth of the bandwidth. */
	interval?: number | string;
	/** Keeps the curve within the data's own extent, instead of letting it fade out past it. */
	trim?: boolean;
	/** Accumulates the estimate into a CDF: `1` from the start, `-1` from the end. */
	cumulative?: false | 1 | -1;
};

/**
 * `densityX` as a marker transform: a 1D kernel density estimate over the `x`
 * values. Replaces the rows with points along `x`, and their density goes to
 * `y` (or `channel`: `y1`/`y2` for a band). One curve per `z` group.
 */
export type DensityXTransform = {
	type: 'densityX';
	/** The channel the density goes to. */
	channel?: 'y' | 'y1' | 'y2';
} & DensityChannels &
	DensityOptions;

/** `densityY` - see {@link DensityXTransform}, estimating over `y` with the density on `x`. */
export type DensityYTransform = {
	type: 'densityY';
	/** The channel the density goes to. */
	channel?: 'x' | 'x1' | 'x2';
} & DensityChannels &
	DensityOptions;
