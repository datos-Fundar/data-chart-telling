import type { Accessor } from '$lib/types/plots/data/common';
import type { StrokeStyle } from '$lib/types/plots/styling';

/** Lines between point pairs: `curve: 'auto'` traces great-circle arcs, `'linear'` joins their projected positions with a straight line. */
export type GeoLinkMarkerConfig<TRow extends Record<string, unknown> = Record<string, unknown>> = {
	type: 'link';
	data: TRow[];
	x1: Accessor<TRow, number>;
	y1: Accessor<TRow, number>;
	x2: Accessor<TRow, number>;
	y2: Accessor<TRow, number>;
	curve?: 'auto' | 'linear';
	altitude?: number;
	occlusion?: 'ground' | 'globe';
	styles?: StrokeStyle;
};
