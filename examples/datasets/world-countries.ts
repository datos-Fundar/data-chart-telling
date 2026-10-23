/// <reference types="vite/client" />
// ── World countries ─────────────────────────────────────────────────────────
// Natural Earth admin-0 countries (110m resolution), in
// `../geo/world-countries.json`. ~1.4MB, loaded as text and parsed on first
// import, so it is not in the barrel.

import type { GeoFeature } from '$lib';
import worldCountriesRaw from '../geo/world-countries.json?raw';

export type WorldCountryProps = {
	name: string;
	name_long: string;
	continent: string;
	subregion: string;
	region_un: string;
	economy: string;
	income_grp: string;
	pop_est: number;
	pop_year: number;
	gdp_md: number;
	gdp_year: number;
	iso_a2: string;
	iso_a3: string;
};

export const WORLD_COUNTRIES: GeoFeature<WorldCountryProps>[] = (
	JSON.parse(worldCountriesRaw) as GeoJSON.FeatureCollection<GeoJSON.Geometry, WorldCountryProps>
).features as GeoFeature<WorldCountryProps>[];

export const WORLD_COUNTRY_NAMES = WORLD_COUNTRIES.map((f) => f.properties!.name);
