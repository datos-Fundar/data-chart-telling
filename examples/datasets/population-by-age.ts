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
