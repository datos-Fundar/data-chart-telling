/// <reference types="vite/client" />
// ── Buenos Aires City's comunas ─────────────────────────────────────────────
// The 15 comunas (communes) making up Buenos Aires City (GCBA open data), in
// `../geo/caba-comunas.json` - finer-grained than the single city feature in
// `ARGENTINA_PROVINCES`. Used as an `inset` marker's `data` to show
// comuna-level detail in a small panel.

import type { GeoFeature } from '$lib';
import cabaComunasRaw from '../geo/caba-comunas.json?raw';

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
