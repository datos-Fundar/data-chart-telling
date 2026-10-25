/// <reference types="vite/client" />
// ── World countries, as TopoJSON ────────────────────────────────────────────
// The same Natural Earth 110m countries, pre-converted to TopoJSON (world-atlas's
// `countries-110m.json`, in `../geo/world-countries-topo.json`): shared borders
// stored once as arcs instead of duplicated per polygon. `objects.countries` is
// the object key to extract; each geometry's `properties.name` is the country
// name (no other fields).

import type { Topology } from '$lib';
import worldCountriesTopoRaw from '../geo/world-countries-topo.json?raw';

export const WORLD_TOPOLOGY: Topology = JSON.parse(worldCountriesTopoRaw) as Topology;
