// Small real datasets shared by the examples and the documentation figures.
// Each section names its source; values are rounded to one decimal.

// ── Monthly inflation by region ─────────────────────────────────────────────
// INDEC, consumer price index (IPC, base December 2016), via the datos.gob.ar
// series API. Change from the previous month, in percent, January 2023 to
// August 2026.

export type RegionRow = { date: Date; region: string; value: number };

export const MONTHS = Array.from(
	{ length: 44 },
	(_, monthIndex) => new Date(Date.UTC(2023, monthIndex, 1))
);

const INFLATION_BY_REGION = [
	{
		region: 'GBA',
		inflation: [
			6, 6.7, 7.8, 8.6, 8, 5.8, 6.2, 12.3, 12.2, 8.6, 12.9, 25.1, 19.6, 15, 11.5, 9.2, 4.3, 4.4, 4,
			4.1, 3.7, 2.8, 2.6, 2.9, 2, 2.2, 3.9, 2.8, 1.5, 2, 1.9, 1.9, 2.1, 2.4, 2.5, 2.8, 2.8, 2.6,
			3.4, 2.8, 2.3, 1.9, 2.3, 1.6
		]
	},
	{
		region: 'Cuyo',
		inflation: [
			6.4, 6.7, 7.9, 7.2, 7.5, 5.3, 6.3, 12.3, 13.7, 7.4, 12.8, 25.8, 22.3, 13.5, 9.3, 8.1, 4.3,
			5.1, 4.6, 4.5, 3, 2.2, 2.1, 2.3, 2, 2.7, 3.5, 2.9, 1.6, 1, 1.9, 2.1, 2.2, 2.3, 2.8, 3, 3, 3.4,
			3.2, 2.1, 2.1, 1.6, 1.9, 1.7
		]
	},
	{
		region: 'Northwest',
		inflation: [
			6.3, 7.3, 7.3, 7.7, 8, 6.6, 6.1, 13.7, 13.2, 7.7, 11.8, 25.2, 21.7, 11.7, 8.8, 9.1, 4.2, 4.8,
			3.6, 5, 3.4, 2.6, 1.9, 2.7, 2.6, 2.6, 4.3, 2.9, 1.2, 1.2, 1.7, 2, 2.2, 2.1, 2.3, 2.6, 2.8,
			3.5, 4, 2.5, 2.1, 1.7, 2, 1.8
		]
	}
];

export const REGIONS = INFLATION_BY_REGION.map(({ region }) => region);

export const REGION_VALUES: RegionRow[] = INFLATION_BY_REGION.flatMap(({ region, inflation }) =>
	MONTHS.map((date, monthIndex) => ({ date, region, value: inflation[monthIndex] }))
);

// ── Monthly inflation by region and year ────────────────────────────────────
// The series above, summarized per region and year: the mean of the monthly
// changes and the lowest and highest month. 2026 holds the eight months so far.

export type InflationRange = {
	period: string;
	region: string;
	year: number;
	mean: number;
	min: number;
	max: number;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

export const INFLATION_RANGES: InflationRange[] = INFLATION_BY_REGION.flatMap(
	({ region, inflation }) =>
		[2023, 2024, 2025, 2026].map((year) => {
			const months = MONTHS.flatMap((date, monthIndex) =>
				date.getUTCFullYear() === year ? [inflation[monthIndex]] : []
			);
			const mean = months.reduce((sum, value) => sum + value, 0) / months.length;
			return {
				period: `${region} ${year}`,
				region,
				year,
				mean: round1(mean),
				min: Math.min(...months),
				max: Math.max(...months)
			};
		})
);

// ── International commodity prices ──────────────────────────────────────────
// IMF, Primary Commodity Prices (PCPS), via DBnomics. Monthly, 2021-2024, as
// an index with January 2021 = 100 so every commodity shares one axis.

export type PriceRow = { date: Date; commodity: string; index: number };

const PRICE_INDEX_BY_COMMODITY = [
	{
		commodity: 'Brent oil',
		index: [
			100, 113, 119, 119, 124, 133, 135, 128, 135, 152, 146, 135, 155, 171, 204, 192, 203, 213, 191,
			177, 164, 170, 165, 148, 152, 151, 144, 151, 137, 136, 145, 154, 168, 161, 149, 140, 143, 148,
			154, 161, 150, 150, 152, 143, 132, 136, 133, 133
		]
	},
	{
		commodity: 'Natural gas',
		index: [
			100, 110, 99, 101, 112, 124, 144, 152, 192, 210, 193, 146, 160, 169, 188, 255, 308, 286, 268,
			331, 296, 230, 245, 217, 131, 92, 91, 83, 87, 94, 100, 100, 102, 120, 115, 96, 103, 68, 66,
			67, 91, 106, 84, 79, 91, 97, 113, 130
		]
	},
	{
		commodity: 'Coal',
		index: [
			100, 102, 105, 108, 115, 145, 168, 191, 207, 265, 195, 199, 255, 299, 388, 368, 460, 470, 477,
			492, 514, 469, 405, 470, 445, 268, 215, 221, 197, 152, 155, 168, 185, 166, 145, 164, 155, 141,
			151, 151, 163, 158, 156, 167, 163, 168, 165, 154
		]
	},
	{
		commodity: 'Wheat',
		index: [
			100, 101, 97, 101, 117, 100, 102, 116, 113, 124, 133, 136, 137, 146, 163, 171, 187, 167, 135,
			136, 146, 149, 145, 136, 135, 140, 130, 131, 126, 119, 117, 101, 96, 91, 91, 97, 95, 92, 89,
			88, 96, 86, 77, 74, 79, 83, 78, 78
		]
	}
];

export const PRICES: PriceRow[] = PRICE_INDEX_BY_COMMODITY.flatMap(({ commodity, index }) =>
	index.map((value, monthIndex) => ({
		date: new Date(Date.UTC(2021, monthIndex, 1)),
		commodity,
		index: value
	}))
);

// ── Life expectancy at birth in Argentina, by sex ───────────────────────────
// INDEC, life tables. Each year stands for the period around it (1947 is
// 1946-1948, 2001 is 2000-2001, ...).

export type LifeRow = { year: number; sex: string; value: number | null };

const LIFE_EXPECTANCY = [
	{ year: 1947, female: 61.4, male: 56.9 },
	{ year: 1965, female: 69.5, male: 63.3 },
	{ year: 1972, female: 70.8, male: 64.1 },
	{ year: 1980, female: 72.7, male: 65.5 },
	{ year: 1991, female: 75.6, male: 68.4 },
	{ year: 2001, female: 77.5, male: 70 },
	{ year: 2009, female: 78.8, male: 72.1 },
	{ year: 2019, female: 80.2, male: 74.4 }
];

export const LIFE: LifeRow[] = LIFE_EXPECTANCY.flatMap(({ year, female, male }) => [
	{ year, sex: 'female', value: female },
	{ year, sex: 'male', value: male }
]);

/** The female series with holes: the first year, one in the middle and the last. */
export const LIFE_GAPS: LifeRow[] = LIFE.filter((row) => row.sex === 'female').map((row) =>
	[1947, 1980, 2019].includes(row.year) ? { ...row, value: null } : row
);

// ── Life expectancy at birth by province, 2019 ──────────────────────────────
// Same source as above. `population` is the 2022 census population, in millions.

export type ProvinceRow = { province: string; sex: string; value: number; population: number };

/** One row per province, a column per sex: for the plots that read two values off each row. */
export type ProvinceLifeRow = {
	province: string;
	female: number;
	male: number;
	population: number;
};

export const PROVINCE_LIFE: ProvinceLifeRow[] = [
	{ province: 'Buenos Aires', female: 79.9, male: 74.1, population: 17.5 },
	{ province: 'Córdoba', female: 80.8, male: 75.2, population: 4 },
	{ province: 'Mendoza', female: 81, male: 75.3, population: 2 },
	{ province: 'Salta', female: 79.5, male: 74, population: 1.4 },
	{ province: 'Chubut', female: 82.1, male: 74.9, population: 0.6 }
];

export const PROVINCES = PROVINCE_LIFE.map(({ province }) => province);

export const PROVINCE_VALUES: ProvinceRow[] = PROVINCE_LIFE.flatMap(
	({ province, female, male, population }) => [
		{ province, sex: 'female', value: female, population },
		{ province, sex: 'male', value: male, population }
	]
);

// ── Population of Buenos Aires City by age and sex ──────────────────────────
// National censuses 1991-2022. Share of the city's population, in percent.

/** The 2022 census: one row per age group and sex, for a pyramid. */
export type AgeRow = { ageGroup: string; sex: string; share: number };

const POPULATION_BY_AGE = [
	{ ageGroup: '0-4', female: 2.3, male: 2.4 },
	{ ageGroup: '5-9', female: 3.1, male: 3.2 },
	{ ageGroup: '10-14', female: 3.1, male: 3.2 },
	{ ageGroup: '15-19', female: 3, male: 3.1 },
	{ ageGroup: '20-24', female: 3.5, male: 3.3 },
	{ ageGroup: '25-29', female: 4, male: 3.7 },
	{ ageGroup: '30-34', female: 3.8, male: 3.6 },
	{ ageGroup: '35-39', female: 3.7, male: 3.5 },
	{ ageGroup: '40-44', female: 3.4, male: 3.1 },
	{ ageGroup: '45-49', female: 3.3, male: 2.8 },
	{ ageGroup: '50-54', female: 3.1, male: 2.5 },
	{ ageGroup: '55-59', female: 2.9, male: 2.4 },
	{ ageGroup: '60-64', female: 2.8, male: 2.2 },
	{ ageGroup: '65-69', female: 2.6, male: 2 },
	{ ageGroup: '70-74', female: 2.6, male: 1.8 },
	{ ageGroup: '75-79', female: 2.3, male: 1.4 },
	{ ageGroup: '80-84', female: 1.8, male: 0.9 },
	{ ageGroup: '85+', female: 2.5, male: 0.9 }
];

export const AGE_GROUPS = POPULATION_BY_AGE.map(({ ageGroup }) => ageGroup);

export const AGES: AgeRow[] = POPULATION_BY_AGE.flatMap(({ ageGroup, female, male }) => [
	{ ageGroup, sex: 'Female', share: female },
	{ ageGroup, sex: 'Male', share: male }
]);

/** The same census data over the years, grouped by sex: the share of each broad age group. */
export type AgeShareRow = { year: number; ageGroup: string; share: number };

export const AGE_SHARES: AgeShareRow[] = [
	{ year: 1991, ageGroup: '0-14', share: 19 },
	{ year: 1991, ageGroup: '15-29', share: 21.7 },
	{ year: 1991, ageGroup: '30-44', share: 20.1 },
	{ year: 1991, ageGroup: '45-64', share: 22.8 },
	{ year: 1991, ageGroup: '65+', share: 16.5 },
	{ year: 2001, ageGroup: '0-14', share: 16.9 },
	{ year: 2001, ageGroup: '15-29', share: 23.2 },
	{ year: 2001, ageGroup: '30-44', share: 19.9 },
	{ year: 2001, ageGroup: '45-64', share: 22.3 },
	{ year: 2001, ageGroup: '65+', share: 17.2 },
	{ year: 2010, ageGroup: '0-14', share: 16.4 },
	{ year: 2010, ageGroup: '15-29', share: 22.4 },
	{ year: 2010, ageGroup: '30-44', share: 22.2 },
	{ year: 2010, ageGroup: '45-64', share: 22.9 },
	{ year: 2010, ageGroup: '65+', share: 16.3 },
	{ year: 2022, ageGroup: '0-14', share: 17.4 },
	{ year: 2022, ageGroup: '15-29', share: 20.7 },
	{ year: 2022, ageGroup: '30-44', share: 21.1 },
	{ year: 2022, ageGroup: '45-64', share: 22 },
	{ year: 2022, ageGroup: '65+', share: 18.9 }
];

/** The same census data over the years, grouped by age: the share of each sex. */
export type SexShareRow = { year: number; sex: string; share: number };

export const SEX_SHARES: SexShareRow[] = [
	{ year: 1991, sex: 'Female', share: 54.6 },
	{ year: 1991, sex: 'Male', share: 45.5 },
	{ year: 2001, sex: 'Female', share: 54.2 },
	{ year: 2001, sex: 'Male', share: 45.3 },
	{ year: 2010, sex: 'Female', share: 54.2 },
	{ year: 2010, sex: 'Male', share: 46 },
	{ year: 2022, sex: 'Female', share: 53.8 },
	{ year: 2022, sex: 'Male', share: 46.2 }
];

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

// ── Households of Buenos Aires City by rooms and people, 2022 ───────────────
// 2022 national census. Share of all households, in percent.

export type HouseholdRow = { rooms: string; people: string; share: number };

export const ROOMS = ['1', '2', '3', '4', '5+'];

const HOUSEHOLD_SHARES = [
	{ people: '1', byRooms: [8.8, 14.8, 9.6, 3.7, 2.1] },
	{ people: '2', byRooms: [3, 8.4, 9.3, 4.5, 2.9] },
	{ people: '3', byRooms: [1.2, 3.4, 5.9, 3.2, 2] },
	{ people: '4', byRooms: [0.6, 1.8, 3.8, 3, 2] },
	{ people: '5+', byRooms: [0.3, 1, 1.7, 1.5, 1.6] }
];

export const HOUSEHOLDS: HouseholdRow[] = HOUSEHOLD_SHARES.flatMap(({ people, byRooms }) =>
	ROOMS.map((rooms, roomsIndex) => ({ rooms, people, share: byRooms[roomsIndex] }))
);

// ── Adult heights by sex ────────────────────────────────────────────────────
// Nancy Howell's census of the !Kung San (Howell1, from the rethinking R
// package), adults only. Heights in centimeters, sorted.

export type HeightRow = { height: number; group: string };

const FEMALE_HEIGHTS = [
	137, 137, 138, 139, 140, 140, 140, 141, 142, 142, 142, 142, 142, 142, 143, 143, 143, 143, 143,
	143, 143, 143, 144, 144, 144, 144, 144, 144, 144, 144, 144, 144, 145, 145, 145, 145, 145, 145,
	145, 145, 145, 145, 145, 145, 145, 145, 146, 146, 146, 146, 146, 146, 146, 146, 147, 147, 147,
	147, 147, 147, 147, 147, 147, 147, 147, 147, 147, 147, 148, 148, 148, 148, 148, 148, 148, 148,
	148, 149, 149, 149, 149, 149, 149, 149, 149, 149, 149, 149, 149, 149, 149, 149, 149, 150, 150,
	150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 151,
	151, 151, 151, 151, 152, 152, 152, 152, 152, 152, 152, 152, 152, 152, 152, 152, 152, 152, 152,
	152, 152, 152, 153, 153, 153, 153, 153, 153, 154, 154, 154, 154, 154, 154, 154, 154, 154, 154,
	154, 154, 154, 154, 155, 155, 155, 155, 155, 155, 155, 156, 156, 156, 156, 156, 156, 156, 156,
	156, 156, 156, 156, 157, 157, 157, 157, 157, 158, 159, 159, 160, 162, 163, 163
];

const MALE_HEIGHTS = [
	140, 142, 146, 147, 148, 149, 149, 149, 149, 151, 151, 152, 152, 152, 152, 152, 152, 152, 152,
	153, 154, 154, 154, 155, 155, 155, 155, 155, 155, 155, 156, 156, 156, 156, 157, 157, 157, 157,
	157, 157, 157, 157, 157, 157, 157, 157, 157, 158, 158, 158, 158, 158, 158, 158, 159, 159, 159,
	159, 159, 159, 159, 159, 159, 159, 159, 159, 160, 160, 160, 160, 160, 160, 160, 160, 160, 160,
	160, 161, 161, 161, 161, 161, 161, 161, 161, 161, 161, 161, 161, 161, 161, 161, 161, 161, 161,
	161, 161, 161, 161, 161, 162, 162, 162, 162, 162, 162, 162, 163, 163, 163, 163, 163, 163, 163,
	163, 163, 163, 163, 163, 163, 163, 164, 164, 164, 164, 164, 164, 164, 164, 164, 164, 164, 165,
	165, 166, 166, 166, 166, 166, 166, 166, 166, 167, 167, 167, 167, 167, 167, 168, 168, 168, 169,
	169, 169, 170, 170, 170, 170, 171, 171, 171, 171, 173, 173, 179
];

export const HEIGHTS: HeightRow[] = [
	...FEMALE_HEIGHTS.map((height) => ({ height, group: 'female' })),
	...MALE_HEIGHTS.map((height) => ({ height, group: 'male' }))
];
