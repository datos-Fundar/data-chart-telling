import type { AnyRowContext, PlotRowContext, RowFunction } from '$lib/types/layout/context';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/** A raster image of a field over a rectangle, drawn to a canvas (svelteplot's `Raster`). */
export type RasterMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'raster';
	fill?: string | RowFunction<unknown, TContext> | ((x: number, y: number) => unknown);
	fillOpacity?:
		| number
		| string
		| RowFunction<number, TContext>
		| ((x: number, y: number) => number);
	width?: number;
	height?: number;
	pixelSize?: number;
	blur?: number;
	interpolate?: 'none' | 'nearest' | 'barycentric' | 'random-walk';
	imageRendering?: string;
	/** Bounds of the raster rectangle, in data coordinates. */
	x1?: number;
	x2?: number;
	y1?: number;
	y2?: number;
} & CommonMarkerConfigWithInterval<TContext>;
