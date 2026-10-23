import { COUNTRIES_OVER_TIME } from '$datasets';

/** Countries from every continent, so any prefix of the list is a varied set of facets. */
const FACET_COUNTRIES = [
	'Argentina',
	'Norway',
	'Nigeria',
	'Japan',
	'Brazil',
	'Germany',
	'India',
	'Kenya',
	'Mexico'
];

/** The first `count` countries' rows, one facet each: five years of GDP per capita, life expectancy and population. */
export const facetCountries = (count: number) =>
	COUNTRIES_OVER_TIME.filter(({ country }) => FACET_COUNTRIES.slice(0, count).includes(country));

/** Countries whose population differs by orders of magnitude, from a few millions to over a billion. */
export const POPULATION_COUNTRIES = COUNTRIES_OVER_TIME.filter(({ country }) =>
	['Norway', 'Argentina', 'Germany', 'Brazil', 'India', 'China'].includes(country)
);
