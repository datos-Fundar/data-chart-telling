/// <reference types="vite/client" />
// ── Rivers of Napoleon's march, 1812 ────────────────────────────────────────
// The rivers and lake centerlines around the route, as GeoJSON lines from
// Natural Earth, in `../geo/napoleons-rivers.json`. Taken from stdlib's
// `datasets-minard-napoleons-march`
// (https://github.com/stdlib-js/datasets-minard-napoleons-march).

import riversRaw from '../geo/napoleons-rivers.json?raw';

export type NapoleonsRiverProps = { name: string | null; featurecla: string; scalerank: number };

export const NAPOLEONS_RIVERS = JSON.parse(riversRaw) as GeoJSON.FeatureCollection<
	GeoJSON.LineString | GeoJSON.MultiLineString,
	NapoleonsRiverProps
>;
