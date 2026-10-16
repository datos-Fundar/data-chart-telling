import type { AxisBasedMarkersConfig } from './common';
import type { GeoMarkersConfig, GeoFeaturesMarkerConfig } from './geo';

/**
 * Every marker kind `GeometryLayout`/`BasePlotLayout` can route to - the
 * union of every plot kind's own `markers` prop type, plus
 * `GeoFeaturesMarkerConfig` (built internally, never author-facing). Not
 * used as any `Plot.svelte`'s own `TMarker` - see each kind's own precise
 * type instead.
 */
export type MarkerConfig = AxisBasedMarkersConfig | GeoMarkersConfig | GeoFeaturesMarkerConfig;
