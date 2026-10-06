import type { ClipUnawareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** The base choropleth mark, one per resolved feature style. Built internally, never authored. */
export type GeoFeaturesMarkerConfig = {
	type: 'geo';
	data: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fill: (d: any) => string;
	fillOpacity?: number;
	stroke?: string;
	strokeWidth?: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onclick?: (e: Event, d: any) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onpointerenter?: (e: Event, d: any) => void;
	onpointerleave?: (e: Event) => void;
} & ClipUnawareMarkerConfig;
