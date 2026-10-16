import type { BasicMarkersConfig } from '$lib/types/markers/basic/basicMarkersConfig';
import type { GeoGraticuleMarkerConfig } from './graticule';
import type { GeoSphereMarkerConfig } from './sphere';
import type { GeoVectorMarkerConfig } from './vector';
import type { GeoLinkMarkerConfig } from './link';
import type { GeoContourMarkerConfig } from './contour';
import type { GeoHoverMarkerConfig } from './geoHover';
import type { GeoCustomComponentMarkerConfig } from './geoComponent';
import type { GeoInsetMarkerConfig } from './inset';

/** Every marker a geo plot accepts. */
export type GeoMarkersConfig =
	| BasicMarkersConfig
	| GeoGraticuleMarkerConfig
	| GeoSphereMarkerConfig
	| GeoVectorMarkerConfig
	| GeoLinkMarkerConfig
	| GeoContourMarkerConfig
	| GeoHoverMarkerConfig
	| GeoCustomComponentMarkerConfig
	| GeoInsetMarkerConfig;
