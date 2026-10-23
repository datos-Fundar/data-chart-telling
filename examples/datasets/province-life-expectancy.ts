// ── Life expectancy at birth by province, 2019 ──────────────────────────────
// INDEC, life tables. `population` is the 2022 census population, in millions.

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

export const FEMALE_PROVINCE_VALUES: ProvinceRow[] = PROVINCE_VALUES.filter(
	({ sex }) => sex === 'female'
);

export const MALE_PROVINCE_VALUES: ProvinceRow[] = PROVINCE_VALUES.filter(
	({ sex }) => sex === 'male'
);
