/// <reference types="vite/client" />
import type { GeoFeature, Topology } from '$lib';
// Loaded with Vite's `?raw` import so TypeScript never structurally infers a
// type from the literal JSON content (these fixtures are ~600KB–1MB — doing
// so would be slow and produce an unusably large inferred type). Parsed and
// cast to a hand-written, trimmed properties type below instead.
import argentinaProvincesRaw from './data/argentina-provinces.json?raw';
import worldCountriesRaw from './data/world-countries.json?raw';
import worldCountriesTopoRaw from './data/world-countries-topo.json?raw';
import usaRaw from './data/usa.json?raw';
import cabaComunasRaw from './data/caba-comunas.json?raw';
import ambaPartidosRaw from './data/amba-partidos.json?raw';

// ── Argentina provinces ──────────────────────────────────────────────────────
// Real boundaries (IGN — Instituto Geográfico Nacional), the 23 provinces +
// CABA. ~600KB — lives only under `stories/`, never bundled into the
// published npm package (`svelte-package` only processes `src/lib`).

export type ArgentinaProvinceProps = {
  id: string;
  nombre: string;
  nombre_completo: string;
  fuente: string;
  categoria: string;
  centroide: { lon: number; lat: number };
  iso_id: string;
  iso_nombre: string;
  /** Approximate 2022 census (INDEC) population — illustrative for the choropleth/value examples, not guaranteed exact. */
  population: number;
};

const PROVINCE_POPULATION_2022: Record<string, number> = {
  'Buenos Aires': 17_569_053,
  'Ciudad Autónoma de Buenos Aires': 3_120_612,
  Córdoba: 3_840_905,
  'Santa Fe': 3_556_522,
  Mendoza: 2_014_533,
  Tucumán: 1_703_186,
  Salta: 1_440_672,
  'Entre Ríos': 1_426_426,
  Misiones: 1_280_960,
  Corrientes: 1_212_696,
  Chaco: 1_142_963,
  'Santiago del Estero': 978_313,
  'San Juan': 798_576,
  Jujuy: 797_955,
  'Río Negro': 747_610,
  Neuquén: 726_590,
  Formosa: 606_041,
  Chubut: 603_120,
  'San Luis': 540_905,
  Catamarca: 429_556,
  'La Rioja': 384_607,
  'La Pampa': 366_022,
  'Santa Cruz': 333_473,
  'Tierra del Fuego, Antártida e Islas del Atlántico Sur': 190_641,
};

type RawArgentinaFeature = GeoJSON.Feature<GeoJSON.Geometry, Omit<ArgentinaProvinceProps, 'population'>>;

export const ARGENTINA_PROVINCES: GeoFeature<ArgentinaProvinceProps>[] = (
  JSON.parse(argentinaProvincesRaw) as GeoJSON.FeatureCollection<GeoJSON.Geometry, Omit<ArgentinaProvinceProps, 'population'>>
).features.map(
  (f: RawArgentinaFeature): GeoFeature<ArgentinaProvinceProps> => ({
    ...f,
    properties: {
      ...f.properties,
      population: PROVINCE_POPULATION_2022[f.properties.nombre] ?? 0,
    },
  }),
);

export const ARGENTINA_PROVINCE_NAMES = ARGENTINA_PROVINCES.map((f) => f.properties!.nombre);

// ── World countries ───────────────────────────────────────────────────────────
// Natural Earth admin-0 countries (110m resolution), real boundaries. ~1MB —
// same story-only scoping as the provinces fixture above.

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

// ── World countries, as TopoJSON ─────────────────────────────────────────────
// The same Natural Earth 110m countries, pre-converted to TopoJSON (world-atlas's
// `countries-110m.json`) — shared borders stored once as arcs instead of
// duplicated per polygon. `objects.countries` is the object key to extract;
// each geometry's `properties.name` is the country name (no other fields).

export const WORLD_TOPOLOGY: Topology = JSON.parse(worldCountriesTopoRaw) as Topology;

// ── United States only ──────────────────────────────────────────────────────
// Same Natural Earth schema as `WORLD_COUNTRIES`, but containing only the US
// (mainland + Alaska + Hawaii, as one MultiPolygon). `albers-usa` assigns
// Alaska/Hawaii to their inset boxes using a coordinate-range heuristic, not
// real country identity — feeding it *other* countries' geometry (e.g.
// Mexico, from `WORLD_COUNTRIES`) can fall into that heuristic and render in
// the wrong place. Keeping this fixture USA-only avoids that entirely.

export const USA_COUNTRY: GeoFeature<WorldCountryProps>[] = (
  JSON.parse(usaRaw) as GeoJSON.FeatureCollection<GeoJSON.Geometry, WorldCountryProps>
).features as GeoFeature<WorldCountryProps>[];

// ── CABA comunas ──────────────────────────────────────────────────────────────
// The 15 comunas (communes) making up the Ciudad Autónoma de Buenos Aires —
// real boundaries, finer-grained than the single CABA feature inside
// `ARGENTINA_PROVINCES`. Used as an `inset` marker's `data` (see the
// `Markers/Inset` stories) to show comuna-level detail in a small panel.

export type CabaComunaProps = {
  id: number;
  objeto: string;
  comuna: number;
  barrios: string;
  perimetro: number;
  area: number;
};

export const CABA_COMUNAS: GeoFeature<CabaComunaProps>[] = (
  JSON.parse(cabaComunasRaw) as GeoJSON.FeatureCollection<GeoJSON.Geometry, CabaComunaProps>
).features as GeoFeature<CabaComunaProps>[];

// ── AMBA partidos ─────────────────────────────────────────────────────────────
// The Área Metropolitana de Buenos Aires — CABA's own comunas plus the
// surrounding Buenos Aires Province partidos (municipalities) making up
// Greater Buenos Aires. Same use as `CABA_COMUNAS`, but for the wider
// CABA-plus-conurbano extent.

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
// right-hand rule (confirmed via `d3.geoArea()`: every feature reports
// ~100% of the sphere instead of its real, tiny share) — reversing every
// ring uniformly flips the whole dataset's convention without disturbing
// exterior/hole relationships, the general fix for "authored backwards"
// data (as opposed to one bad ring in an otherwise-correct dataset, see
// `argentina-provinces.json`'s Corrientes fix).
function fixWinding(geometry: GeoJSON.Geometry): GeoJSON.Geometry {
  if (geometry.type === 'Polygon') {
    return { ...geometry, coordinates: geometry.coordinates.map((ring) => [...ring].reverse()) };
  }
  if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon) => polygon.map((ring) => [...ring].reverse())),
    };
  }
  return geometry;
}

export const AMBA_PARTIDOS: GeoFeature<AmbaPartidoProps>[] = (
  JSON.parse(ambaPartidosRaw) as GeoJSON.FeatureCollection<GeoJSON.Geometry, AmbaPartidoProps>
).features.map((f) => ({ ...f, geometry: fixWinding(f.geometry) })) as GeoFeature<AmbaPartidoProps>[];

// ── Point fixtures ────────────────────────────────────────────────────────────
// Real city coordinates, used by the point-based markers (dot/vector/link/contour).

export type WeatherStation = {
  city: string;
  lon: number;
  lat: number;
  tempC: number;
};

/** Real capitals with a made-up temperature reading — mirrors svelteplot's `dot/weather` and `contour/weather` examples. */
export const WEATHER_STATIONS: WeatherStation[] = [
  { city: 'Buenos Aires', lon: -58.4, lat: -34.6, tempC: 28 },
  { city: 'Santiago', lon: -70.6, lat: -33.4, tempC: 24 },
  { city: 'Brasília', lon: -47.9, lat: -15.8, tempC: 31 },
  { city: 'Montevideo', lon: -56.2, lat: -34.9, tempC: 22 },
  { city: 'Asunción', lon: -57.6, lat: -25.3, tempC: 33 },
  { city: 'La Paz', lon: -68.1, lat: -16.5, tempC: 14 },
  { city: 'Bogotá', lon: -74.1, lat: 4.7, tempC: 19 },
  { city: 'Lima', lon: -77.0, lat: -12.0, tempC: 21 },
];

export type ShiftVector = {
  city: string;
  lon: number;
  lat: number;
  magnitude: number;
  direction: number;
};

/** A made-up "population shift" per capital (magnitude in km, direction in degrees) — mirrors svelteplot's `vector/shift-map` example. */
export const POPULATION_SHIFT: ShiftVector[] = [
  { city: 'Buenos Aires', lon: -58.4, lat: -34.6, magnitude: 28, direction: 200 },
  { city: 'Santiago', lon: -70.6, lat: -33.4, magnitude: 14, direction: 95 },
  { city: 'Brasília', lon: -47.9, lat: -15.8, magnitude: 22, direction: 40 },
  { city: 'Montevideo', lon: -56.2, lat: -34.9, magnitude: 9, direction: 260 },
  { city: 'Asunción', lon: -57.6, lat: -25.3, magnitude: 17, direction: 150 },
  { city: 'La Paz', lon: -68.1, lat: -16.5, magnitude: 25, direction: 310 },
];

export type FlightRoute = {
  route: string;
  fromLon: number;
  fromLat: number;
  toLon: number;
  toLat: number;
};

/** Long-haul routes chosen to make the geodesic ("spherical") curve visually obvious — mirrors svelteplot's `link/spherical-link` example. */
export const FLIGHT_ROUTES: FlightRoute[] = [
  { route: 'Buenos Aires – Tokyo', fromLon: -58.4, fromLat: -34.6, toLon: 139.7, toLat: 35.7 },
  { route: 'Buenos Aires – London', fromLon: -58.4, fromLat: -34.6, toLon: -0.1, toLat: 51.5 },
  { route: 'Santiago – Sydney', fromLon: -70.6, fromLat: -33.4, toLon: 151.2, toLat: -33.9 },
  { route: 'São Paulo – Cairo', fromLon: -46.6, fromLat: -23.5, toLon: 31.2, toLat: 30.0 },
];

export type Earthquake = {
  lon: number;
  lat: number;
  magnitude: number;
};

/** Points loosely tracing the Andes — mirrors svelteplot's `geo/earthquakes` example (graticule + sphere + dots from raw lon/lat rows). */
export const EARTHQUAKES: Earthquake[] = [
  { lon: -72.0, lat: 4.5, magnitude: 4.2 },
  { lon: -71.5, lat: -2.0, magnitude: 5.6 },
  { lon: -71.0, lat: -9.5, magnitude: 6.1 },
  { lon: -69.5, lat: -16.0, magnitude: 4.8 },
  { lon: -68.0, lat: -22.5, magnitude: 5.9 },
  { lon: -70.5, lat: -30.0, magnitude: 6.7 },
  { lon: -71.5, lat: -37.0, magnitude: 5.3 },
  { lon: -72.5, lat: -45.0, magnitude: 4.9 },
];
