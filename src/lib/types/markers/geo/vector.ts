import type { Accessor } from '$lib/types/plots/data/common';

/** Arrows or spikes at points (svelteplot's `Vector`). */
export type GeoVectorMarkerConfig<TRow extends Record<string, unknown> = Record<string, unknown>> =
	{
		type: 'vector';
		data: TRow[];
		x: Accessor<TRow, number>;
		y: Accessor<TRow, number>;
		length?: Accessor<TRow, number> | number;
		rotate?: Accessor<TRow, number> | number;
		shape?: 'arrow' | 'spike' | 'arrow-filled';
		anchor?: 'start' | 'middle' | 'end';
		styles?: { fill?: string; stroke?: string; strokeWidth?: number };
	};
