// ── Countries over time, 1987-2007 ──────────────────────────────────────────
// Gapminder, via plotly/datasets: a selection of countries, every five years.
// GDP per capita in US dollars (PPP, 2005 prices), life expectancy in years,
// population in millions. `income` groups the countries by GDP per capita.

export type CountryYearRow = {
	country: string;
	continent: string;
	year: number;
	gdp: number;
	life: number;
	population: number;
	income: string;
};

const YEARS = [1987, 1992, 1997, 2002, 2007];

/** Per country, one `[gdp, life, population]` for each of `YEARS`. */
const COUNTRY_TRAJECTORIES = [
	{
		country: 'Nigeria',
		continent: 'Africa',
		indicators: [
			[1385, 46.9, 81.6],
			[1620, 47.5, 93.4],
			[1625, 47.5, 106.2],
			[1615, 46.6, 119.9],
			[2014, 46.9, 135]
		]
	},
	{
		country: 'Egypt',
		continent: 'Africa',
		indicators: [
			[3885, 59.8, 52.8],
			[3795, 63.7, 59.4],
			[4173, 67.2, 66.1],
			[4755, 69.8, 73.3],
			[5581, 71.3, 80.3]
		]
	},
	{
		country: 'South Africa',
		continent: 'Africa',
		indicators: [
			[7826, 60.8, 35.9],
			[7225, 61.9, 40],
			[7479, 60.2, 42.8],
			[7711, 53.4, 44.4],
			[9270, 49.3, 44]
		]
	},
	{
		country: 'Ethiopia',
		continent: 'Africa',
		indicators: [
			[574, 46.7, 43],
			[421, 48.1, 52.1],
			[516, 49.4, 59.9],
			[530, 50.7, 67.9],
			[691, 52.9, 76.5]
		]
	},
	{
		country: 'Kenya',
		continent: 'Africa',
		indicators: [
			[1362, 59.3, 21.2],
			[1342, 59.3, 25],
			[1360, 54.4, 28.3],
			[1288, 51, 31.4],
			[1463, 54.1, 35.6]
		]
	},
	{
		country: 'Morocco',
		continent: 'Africa',
		indicators: [
			[2755, 62.7, 23],
			[2948, 65.4, 25.8],
			[2982, 67.7, 28.5],
			[3258, 69.6, 31.2],
			[3820, 71.2, 33.8]
		]
	},
	{
		country: 'Ghana',
		continent: 'Africa',
		indicators: [
			[847, 55.7, 14.2],
			[925, 57.5, 16.3],
			[1005, 58.6, 18.4],
			[1112, 58.5, 20.6],
			[1328, 60, 22.9]
		]
	},
	{
		country: 'Argentina',
		continent: 'Americas',
		indicators: [
			[9140, 70.8, 31.6],
			[9308, 71.9, 34],
			[10967, 73.3, 36.2],
			[8798, 74.3, 38.3],
			[12779, 75.3, 40.3]
		]
	},
	{
		country: 'Brazil',
		continent: 'Americas',
		indicators: [
			[7807, 65.2, 142.9],
			[6950, 67.1, 156],
			[7958, 69.4, 168.5],
			[8131, 71, 179.9],
			[9066, 72.4, 190]
		]
	},
	{
		country: 'Chile',
		continent: 'Americas',
		indicators: [
			[5547, 72.5, 12.5],
			[7596, 74.1, 13.6],
			[10118, 75.8, 14.6],
			[10779, 77.9, 15.5],
			[13172, 78.6, 16.3]
		]
	},
	{
		country: 'Mexico',
		continent: 'Americas',
		indicators: [
			[8688, 69.5, 80.1],
			[9472, 71.5, 88.1],
			[9767, 73.7, 95.9],
			[10742, 74.9, 102.5],
			[11978, 76.2, 108.7]
		]
	},
	{
		country: 'United States',
		continent: 'Americas',
		indicators: [
			[29884, 75, 242.8],
			[32004, 76.1, 256.9],
			[35767, 76.8, 272.9],
			[39097, 77.3, 287.7],
			[42952, 78.2, 301.1]
		]
	},
	{
		country: 'Canada',
		continent: 'Americas',
		indicators: [
			[26627, 76.9, 26.5],
			[26343, 78, 28.5],
			[28955, 78.6, 30.3],
			[33329, 79.8, 31.9],
			[36319, 80.7, 33.4]
		]
	},
	{
		country: 'Bolivia',
		continent: 'Americas',
		indicators: [
			[2754, 57.3, 6.2],
			[2962, 60, 6.9],
			[3326, 62.1, 7.7],
			[3413, 63.9, 8.4],
			[3822, 65.6, 9.1]
		]
	},
	{
		country: 'China',
		continent: 'Asia',
		indicators: [
			[1379, 67.3, 1084],
			[1656, 68.7, 1165],
			[2289, 70.4, 1230.1],
			[3119, 72, 1280.4],
			[4959, 73, 1318.7]
		]
	},
	{
		country: 'India',
		continent: 'Asia',
		indicators: [
			[977, 58.6, 788],
			[1164, 60.2, 872],
			[1459, 61.8, 959],
			[1747, 62.9, 1034.2],
			[2452, 64.7, 1110.4]
		]
	},
	{
		country: 'Japan',
		continent: 'Asia',
		indicators: [
			[22376, 78.7, 122.1],
			[26825, 79.4, 124.3],
			[28817, 80.7, 126],
			[28605, 82, 127.1],
			[31656, 82.6, 127.5]
		]
	},
	{
		country: 'Indonesia',
		continent: 'Asia',
		indicators: [
			[1748, 60.1, 169.3],
			[2383, 62.7, 184.8],
			[3119, 66, 199.3],
			[2874, 68.6, 211.1],
			[3541, 70.7, 223.5]
		]
	},
	{
		country: 'Vietnam',
		continent: 'Asia',
		indicators: [
			[821, 62.8, 62.8],
			[989, 67.7, 69.9],
			[1386, 70.7, 76],
			[1764, 73, 80.9],
			[2442, 74.2, 85.3]
		]
	},
	{
		country: 'Pakistan',
		continent: 'Asia',
		indicators: [
			[1705, 58.2, 105.2],
			[1972, 60.8, 120.1],
			[2049, 61.8, 135.6],
			[2093, 63.6, 153.4],
			[2606, 65.5, 169.3]
		]
	},
	{
		country: 'South Korea',
		continent: 'Asia',
		indicators: [
			[8533, 69.8, 41.6],
			[12104, 72.2, 43.8],
			[15994, 74.6, 46.2],
			[19234, 77, 48],
			[23348, 78.6, 49]
		]
	},
	{
		country: 'Germany',
		continent: 'Europe',
		indicators: [
			[24639, 74.8, 77.7],
			[26505, 76.1, 80.6],
			[27789, 77.3, 82],
			[30036, 78.7, 82.4],
			[32170, 79.4, 82.4]
		]
	},
	{
		country: 'France',
		continent: 'Europe',
		indicators: [
			[22066, 76.3, 55.6],
			[24704, 77.5, 57.4],
			[25890, 78.6, 58.6],
			[28926, 79.6, 59.9],
			[30470, 80.7, 61.1]
		]
	},
	{
		country: 'Spain',
		continent: 'Europe',
		indicators: [
			[15765, 76.9, 38.9],
			[18603, 77.6, 39.5],
			[20445, 78.8, 39.9],
			[24835, 79.8, 40.2],
			[28821, 80.9, 40.4]
		]
	},
	{
		country: 'Italy',
		continent: 'Europe',
		indicators: [
			[19207, 76.4, 56.7],
			[22014, 77.4, 56.8],
			[24675, 78.8, 57.5],
			[27968, 80.2, 57.9],
			[28570, 80.5, 58.1]
		]
	},
	{
		country: 'United Kingdom',
		continent: 'Europe',
		indicators: [
			[21665, 75, 57],
			[22705, 76.4, 57.9],
			[26075, 77.2, 58.8],
			[29479, 78.5, 59.9],
			[33203, 79.4, 60.8]
		]
	},
	{
		country: 'Poland',
		continent: 'Europe',
		indicators: [
			[9082, 71, 37.7],
			[7739, 71, 38.4],
			[10160, 72.8, 38.7],
			[12002, 74.7, 38.6],
			[15390, 75.6, 38.5]
		]
	},
	{
		country: 'Norway',
		continent: 'Europe',
		indicators: [
			[31541, 75.9, 4.2],
			[33966, 77.3, 4.3],
			[41283, 78.3, 4.4],
			[44684, 79.1, 4.5],
			[49357, 80.2, 4.6]
		]
	}
];

export const COUNTRIES_OVER_TIME: CountryYearRow[] = COUNTRY_TRAJECTORIES.flatMap(
	({ country, continent, indicators }) =>
		indicators.map(([gdp, life, population], i) => ({
			country,
			continent,
			year: YEARS[i],
			gdp,
			life,
			population,
			income: gdp >= 20000 ? 'High' : gdp >= 5000 ? 'Middle' : 'Low'
		}))
);

/** The 2007 snapshot alone. */
export const COUNTRIES_AT_2007: CountryYearRow[] = COUNTRIES_OVER_TIME.filter(
	({ year }) => year === 2007
);
