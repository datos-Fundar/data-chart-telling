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
	/** Lifts each arc off the map: a fraction of the radius on a globe, of the route's length on a flat map. A lifted arc keeps near its parallels instead of following the great circle. */
	altitude?: number;
	/** On a globe with `altitude`: `'ground'` cuts an arc where its ground track passes the horizon, `'globe'` only where the globe covers it. */
	occlusion?: 'ground' | 'globe';
	styles?: StrokeStyle;
};
