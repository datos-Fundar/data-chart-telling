// ── Countries, 2007 ─────────────────────────────────────────────────────────
// Gapminder, via plotly/datasets. GDP per capita in US dollars (PPP, 2005
// prices), life expectancy in years, population in millions. `income` groups
// the countries by GDP per capita.

export type CountryRow = {
	country: string;
	gdp: number;
	life: number;
	population: number;
	continent: string;
	income: string;
};

const COUNTRY_INDICATORS = [
	{ country: 'Nigeria', continent: 'Africa', gdp: 2014, life: 46.9, population: 135 },
	{ country: 'Egypt', continent: 'Africa', gdp: 5581, life: 71.3, population: 80.3 },
	{ country: 'South Africa', continent: 'Africa', gdp: 9270, life: 49.3, population: 44 },
	{ country: 'Ethiopia', continent: 'Africa', gdp: 691, life: 52.9, population: 76.5 },
	{ country: 'Kenya', continent: 'Africa', gdp: 1463, life: 54.1, population: 35.6 },
	{ country: 'Morocco', continent: 'Africa', gdp: 3820, life: 71.2, population: 33.8 },
	{ country: 'Ghana', continent: 'Africa', gdp: 1328, life: 60, population: 22.9 },
	{ country: 'Argentina', continent: 'Americas', gdp: 12779, life: 75.3, population: 40.3 },
	{ country: 'Brazil', continent: 'Americas', gdp: 9066, life: 72.4, population: 190 },
	{ country: 'Chile', continent: 'Americas', gdp: 13172, life: 78.6, population: 16.3 },
	{ country: 'Mexico', continent: 'Americas', gdp: 11978, life: 76.2, population: 108.7 },
	{ country: 'United States', continent: 'Americas', gdp: 42952, life: 78.2, population: 301.1 },
	{ country: 'Canada', continent: 'Americas', gdp: 36319, life: 80.7, population: 33.4 },
	{ country: 'Bolivia', continent: 'Americas', gdp: 3822, life: 65.6, population: 9.1 },
	{ country: 'China', continent: 'Asia', gdp: 4959, life: 73, population: 1318.7 },
	{ country: 'India', continent: 'Asia', gdp: 2452, life: 64.7, population: 1110.4 },
	{ country: 'Japan', continent: 'Asia', gdp: 31656, life: 82.6, population: 127.5 },
	{ country: 'Indonesia', continent: 'Asia', gdp: 3541, life: 70.7, population: 223.5 },
	{ country: 'Vietnam', continent: 'Asia', gdp: 2442, life: 74.2, population: 85.3 },
	{ country: 'Pakistan', continent: 'Asia', gdp: 2606, life: 65.5, population: 169.3 },
	{ country: 'South Korea', continent: 'Asia', gdp: 23348, life: 78.6, population: 49 },
	{ country: 'Germany', continent: 'Europe', gdp: 32170, life: 79.4, population: 82.4 },
	{ country: 'France', continent: 'Europe', gdp: 30470, life: 80.7, population: 61.1 },
	{ country: 'Spain', continent: 'Europe', gdp: 28821, life: 80.9, population: 40.4 },
	{ country: 'Italy', continent: 'Europe', gdp: 28570, life: 80.5, population: 58.1 },
	{ country: 'United Kingdom', continent: 'Europe', gdp: 33203, life: 79.4, population: 60.8 },
	{ country: 'Poland', continent: 'Europe', gdp: 15390, life: 75.6, population: 38.5 },
	{ country: 'Norway', continent: 'Europe', gdp: 49357, life: 80.2, population: 4.6 }
];

export const COUNTRIES: CountryRow[] = COUNTRY_INDICATORS.map((country) => ({
	...country,
	income: country.gdp >= 20000 ? 'High' : country.gdp >= 5000 ? 'Middle' : 'Low'
}));
