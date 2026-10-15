import type { GeoFeature } from '$lib/types/plots/data/geo';
import type { ArgentinaProvinceProps, WorldCountryProps } from './data';

// Named on purpose: a plot titles its legend with the name of its `color` function.
// They take a plain `GeoFeature`, so they fit any plot whatever its feature properties.

/** A province's 2022 population. */
export const provincePopulation = (f: GeoFeature) =>
	(f.properties as ArgentinaProvinceProps).population;

/** A country's estimated population. */
export const countryPopulation = (f: GeoFeature) => (f.properties as WorldCountryProps).pop_est;

/** A country's GDP, in millions of dollars. */
export const countryGdp = (f: GeoFeature) => (f.properties as WorldCountryProps).gdp_md;

/** A country's GDP divided by its population. */
export const gdpPerPerson = (f: GeoFeature) => {
	const p = f.properties as WorldCountryProps;
	return p.pop_est ? (p.gdp_md * 1e6) / p.pop_est : undefined;
};
