/// <reference types="vite/client" />
// ── United States only ──────────────────────────────────────────────────────
// Same Natural Earth schema as `WORLD_COUNTRIES`, but containing only the US
// (mainland + Alaska + Hawaii, as one MultiPolygon), in `../geo/usa.json`.
// `albers-usa` assigns Alaska/Hawaii to their inset boxes using a
// coordinate-range heuristic, not real country identity - feeding it *other*
// countries' geometry (e.g. Mexico, from `WORLD_COUNTRIES`) can fall into that
// heuristic and render in the wrong place. Keeping this one USA-only avoids that.

import type { GeoFeature } from '$lib';
import usaRaw from '../geo/usa.json?raw';
import type { WorldCountryProps } from './world-countries';

export const USA_COUNTRY: GeoFeature<WorldCountryProps>[] = (
	JSON.parse(usaRaw) as GeoJSON.FeatureCollection<GeoJSON.Geometry, WorldCountryProps>
).features as GeoFeature<WorldCountryProps>[];
