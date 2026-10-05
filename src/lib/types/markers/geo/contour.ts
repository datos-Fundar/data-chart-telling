import type { Accessor } from '$lib/types/plots/data/common';

/**
 * Marching-squares contours from a scalar field (svelteplot's `Contour`).
 * Pass `data` with `x`/`y`/`value` to interpolate samples, or omit `data` and
 * pass `value` as an `(x, y) => number` sampler.
 */
export type GeoContourMarkerConfig<TRow extends Record<string, unknown> = Record<string, unknown>> =
	{
		type: 'contour';
		data?: TRow[];
		x?: Accessor<TRow, number>;
		y?: Accessor<TRow, number>;
		value?: Accessor<TRow, number> | ((x: number, y: number) => number);
		thresholds?: number | number[];
		fill?: 'value' | string;
		stroke?: 'value' | string;
		blur?: number;
		interpolate?: 'none' | 'nearest' | 'barycentric' | 'random-walk';
		styles?: { strokeWidth?: number; fillOpacity?: number; strokeOpacity?: number };
		/** Masks the contour to the base map's land or water. */
		clip?: 'land' | 'ocean';
		/** Draws behind the base map instead of over it. */
		behind?: boolean;
	};
