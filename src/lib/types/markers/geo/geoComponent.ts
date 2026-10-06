/** Mounts an arbitrary Svelte component as a geo mark. */
export type GeoCustomComponentMarkerConfig = {
	type: 'geo-component';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: any;
	props?: Record<string, unknown>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data?: any[];
};
