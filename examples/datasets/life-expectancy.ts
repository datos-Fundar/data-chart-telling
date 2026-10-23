// ── Life expectancy at birth in Argentina, by sex ───────────────────────────
// INDEC, life tables: the country over the years, and each province in 2019.

import { PROVINCE_POPULATION_2022 } from './province-population';

// ── Country, over the years ─────────────────────────────────────────────────
// Each year stands for the period around it (1947 is 1946-1948, 2001 is
// 2000-2001, ...).

export type LifeRow = { year: number; sex: 'female' | 'male'; value: number };

/** A life expectancy row that may have a missing value. */
export type LifeRowWithGaps = Omit<LifeRow, 'value'> & { value: number | null };

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

export const FEMALE_LIFE: LifeRow[] = LIFE.filter((row) => row.sex === 'female');

export const MALE_LIFE: LifeRow[] = LIFE.filter((row) => row.sex === 'male');

/** The female series with holes: the first year, one in the middle and the last. */
export const FEMALE_LIFE_GAPS: LifeRowWithGaps[] = FEMALE_LIFE.map((row) =>
	[1947, 1980, 2019].includes(row.year) ? { ...row, value: null } : row
);

/** The male series with a single hole, in a different place than the female one. */
export const MALE_LIFE_GAPS: LifeRowWithGaps[] = MALE_LIFE.map((row) =>
	row.year === 1991 ? { ...row, value: null } : row
);

// ── Provinces, 2019 ─────────────────────────────────────────────────────────
// `population` is the 2022 census population (`province-population.ts`), in millions.

export type ProvinceRow = {
	province: string;
	sex: 'female' | 'male';
	value: number;
	population: number;
};

/** One row per province, a column per sex: for the plots that read two values off each row. */
export type ProvinceLifeRow = {
	province: string;
	female: number;
	male: number;
	population: number;
};

const LIFE_BY_PROVINCE = [
	{ province: 'Buenos Aires', female: 79.9, male: 74.1 },
	{ province: 'Córdoba', female: 80.8, male: 75.2 },
	{ province: 'Mendoza', female: 81, male: 75.3 },
	{ province: 'Salta', female: 79.5, male: 74 },
	{ province: 'Chubut', female: 82.1, male: 74.9 }
];

const POPULATION_2022 = new Map(
	PROVINCE_POPULATION_2022.map(({ province, population }) => [province, population])
);

export const PROVINCE_LIFE: ProvinceLifeRow[] = LIFE_BY_PROVINCE.map((row) => ({
	...row,
	population: Math.round(POPULATION_2022.get(row.province)! / 100_000) / 10
}));

export const PROVINCES = PROVINCE_LIFE.map(({ province }) => province);

export const PROVINCE_VALUES: ProvinceRow[] = PROVINCE_LIFE.flatMap(
	({ province, female, male, population }) => [
		{ province, sex: 'female', value: female, population },
		{ province, sex: 'male', value: male, population }
	]
);

export const FEMALE_PROVINCE_VALUES: ProvinceRow[] = PROVINCE_VALUES.filter(
	({ sex }) => sex === 'female'
);

export const MALE_PROVINCE_VALUES: ProvinceRow[] = PROVINCE_VALUES.filter(
	({ sex }) => sex === 'male'
);
