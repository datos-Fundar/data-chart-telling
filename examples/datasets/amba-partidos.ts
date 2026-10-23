/// <reference types="vite/client" />
// ── Greater Buenos Aires' partidos ──────────────────────────────────────────
// The Área Metropolitana de Buenos Aires: the city's own comunas plus the
// surrounding Buenos Aires Province partidos (municipalities) making up Greater
// Buenos Aires (IGN), in `../geo/amba-partidos.json`. Same use as
// `CABA_COMUNAS`, for the wider extent.

import type { GeoFeature } from '$lib';
import ambaPartidosRaw from '../geo/amba-partidos.json?raw';

export type AmbaPartidoProps = {
	gid: number;
	objeto: string;
	fna: string;
	gna: string;
	nam: string;
	in1: string;
	fdc: string;
	sag: string;
};

// The source file's every ring winds the opposite way from RFC 7946's
// right-hand rule (every feature reports ~100% of the sphere in `d3.geoArea()`
// instead of its real, tiny share). Reversing every ring flips the whole
// dataset's convention without disturbing exterior/hole relationships.
function fixWinding(geometry: GeoJSON.Geometry): GeoJSON.Geometry {
	if (geometry.type === 'Polygon') {
		return { ...geometry, coordinates: geometry.coordinates.map((ring) => [...ring].reverse()) };
	}
	if (geometry.type === 'MultiPolygon') {
		return {
			...geometry,
			coordinates: geometry.coordinates.map((polygon) => polygon.map((ring) => [...ring].reverse()))
		};
	}
	return geometry;
}

export const AMBA_PARTIDOS: GeoFeature<AmbaPartidoProps>[] = (
	JSON.parse(ambaPartidosRaw) as GeoJSON.FeatureCollection<GeoJSON.Geometry, AmbaPartidoProps>
).features.map((f) => ({
	...f,
	geometry: fixWinding(f.geometry)
})) as GeoFeature<AmbaPartidoProps>[];
