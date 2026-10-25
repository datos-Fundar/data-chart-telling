// ── Argentina and Chile, 1987-2007 ──────────────────────────────────────────
// Gapminder, via the countries-over-time series: each country's GDP per capita
// and population, as an index with 1987 = 100 so both metrics share one axis.

import { COUNTRIES_OVER_TIME } from './countries-over-time';

/** One country's GDP per capita or population, one row per year. */
export type CountryTrendRow = {
	year: number;
	country: string;
	metric: string;
	value: number;
};

export const ARGENTINA_CHILE_TRENDS: CountryTrendRow[] = ['Argentina', 'Chile'].flatMap(
	(country) => {
		const rows = COUNTRIES_OVER_TIME.filter((row) => row.country === country);
		const [first] = rows;
		return rows.flatMap(({ year, gdp, population }) => [
			{
				year,
				country,
				metric: 'GDP per capita',
				value: Math.round((gdp / first.gdp) * 100)
			},
			{
				year,
				country,
				metric: 'Population',
				value: Math.round((population / first.population) * 100)
			}
		]);
	}
);
