import type { Accessor } from '$lib/types/plots/data/common';
import type { StrokeStyle } from '$lib/types/plots/styling';
import type { ClipUnawareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** Lines between point pairs (svelteplot's `Link`); `curve: 'auto'` traces great-circle arcs. */
export type GeoLinkMarkerConfig<TRow extends Record<string, unknown> = Record<string, unknown>> = {
	type: 'link';
	data: TRow[];
	x1: Accessor<TRow, number>;
	y1: Accessor<TRow, number>;
	x2: Accessor<TRow, number>;
	y2: Accessor<TRow, number>;
	curve?: 'auto' | 'linear';
	styles?: StrokeStyle;
} & ClipUnawareMarkerConfig;
