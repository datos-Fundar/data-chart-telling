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
	/** The features the pointer can match as the plot's hover, by `__id`. */
	hover?: Map<string, Record<string, unknown>>;
};
