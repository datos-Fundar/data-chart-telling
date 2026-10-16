import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/** A raster image of a field over a rectangle, drawn to a canvas (svelteplot's `Raster`). */
export type RasterMarkerConfig = {
	type: 'raster';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fill?: string | ((d: any) => unknown) | ((x: number, y: number) => unknown);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fillOpacity?: number | string | ((d: any) => number) | ((x: number, y: number) => number);
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
} & CommonMarkerConfigWithInterval;
