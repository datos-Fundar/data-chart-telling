/// <reference types="vite/client" />
// ── Argentina's provinces ───────────────────────────────────────────────────
// The boundaries of the 23 provinces and Buenos Aires City (IGN, Instituto
// Geográfico Nacional), in `../geo/argentina-provinces.json`, with each one's
// 2022 census population (INDEC). Not exported from the barrel: the boundaries
// are ~800KB, loaded as text and parsed on first import, so only the files that
// draw them pay for them.

import type { GeoFeature } from '$lib';
import argentinaProvincesRaw from '../geo/argentina-provinces.json?raw';
import { PROVINCE_POPULATION_2022 } from './province-population';

export type ArgentinaProvinceProps = {
	id: string;
	nombre: string;
	nombre_completo: string;
	fuente: string;
	categoria: string;
	centroide: { lon: number; lat: number };
	iso_id: string;
	iso_nombre: string;
	/** People living in the province at the 2022 census. */
	population: number;
};

const POPULATION_BY_NAME = new Map(
	PROVINCE_POPULATION_2022.map(({ province, population }) => [province, population])
);

type RawProvince = GeoJSON.Feature<GeoJSON.Geometry, Omit<ArgentinaProvinceProps, 'population'>>;

export const ARGENTINA_PROVINCES: GeoFeature<ArgentinaProvinceProps>[] = (
	JSON.parse(argentinaProvincesRaw) as GeoJSON.FeatureCollection<
		GeoJSON.Geometry,
		Omit<ArgentinaProvinceProps, 'population'>
	>
).features.map(
	(feature: RawProvince): GeoFeature<ArgentinaProvinceProps> => ({
		...feature,
		properties: {
			...feature.properties,
			population: POPULATION_BY_NAME.get(feature.properties.nombre) ?? 0
		}
	})
);

export const ARGENTINA_PROVINCE_NAMES = ARGENTINA_PROVINCES.map((f) => f.properties!.nombre);
