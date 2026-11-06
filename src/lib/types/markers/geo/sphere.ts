import type { CommonMarkerEvents } from '$lib/types/markers/channels/commonMarkerEvents';
import type { StrokeStyle } from '$lib/types/plots/styling';

/** The outer globe outline (svelteplot's `Sphere`), for orthographic-type projections. */
export type GeoSphereMarkerConfig = CommonMarkerEvents & {
	type: 'sphere';
	styles?: StrokeStyle & { fill?: string; fillOpacity?: number };
	/** Draws behind the base map instead of over it. */
	behind?: boolean;
};
