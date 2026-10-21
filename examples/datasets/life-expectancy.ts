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
