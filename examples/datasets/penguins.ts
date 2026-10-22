// ── Penguins ────────────────────────────────────────────────────────────────
// Palmer Station penguins (Gorman, Williams & Fraser, 2014), as distributed by
// mwaskom/seaborn-data. Count of the 333 penguins sexed in the study, by
// species, island and sex.

export type PenguinCount = {
	species: string;
	island: string;
	sex: 'Female' | 'Male';
	count: number;
};

export const PENGUIN_SPECIES = ['Adelie', 'Chinstrap', 'Gentoo'];

export const PENGUIN_ISLANDS = ['Biscoe', 'Dream', 'Torgersen'];

export const PENGUIN_SEXES: PenguinCount['sex'][] = ['Female', 'Male'];

/** One row per species, island and sex; a species absent from an island counts 0. */
export const PENGUIN_COUNTS_BY_SEX: PenguinCount[] = [
	{ species: 'Adelie', island: 'Biscoe', sex: 'Female', count: 22 },
	{ species: 'Adelie', island: 'Dream', sex: 'Female', count: 27 },
	{ species: 'Adelie', island: 'Torgersen', sex: 'Female', count: 24 },
	{ species: 'Chinstrap', island: 'Biscoe', sex: 'Female', count: 0 },
	{ species: 'Chinstrap', island: 'Dream', sex: 'Female', count: 34 },
	{ species: 'Chinstrap', island: 'Torgersen', sex: 'Female', count: 0 },
	{ species: 'Gentoo', island: 'Biscoe', sex: 'Female', count: 58 },
	{ species: 'Gentoo', island: 'Dream', sex: 'Female', count: 0 },
	{ species: 'Gentoo', island: 'Torgersen', sex: 'Female', count: 0 },
	{ species: 'Adelie', island: 'Biscoe', sex: 'Male', count: 22 },
	{ species: 'Adelie', island: 'Dream', sex: 'Male', count: 28 },
	{ species: 'Adelie', island: 'Torgersen', sex: 'Male', count: 23 },
	{ species: 'Chinstrap', island: 'Biscoe', sex: 'Male', count: 0 },
	{ species: 'Chinstrap', island: 'Dream', sex: 'Male', count: 34 },
	{ species: 'Chinstrap', island: 'Torgersen', sex: 'Male', count: 0 },
	{ species: 'Gentoo', island: 'Biscoe', sex: 'Male', count: 61 },
	{ species: 'Gentoo', island: 'Dream', sex: 'Male', count: 0 },
	{ species: 'Gentoo', island: 'Torgersen', sex: 'Male', count: 0 }
];

/** One row per species and island, both sexes together; `speciesTotal` is the species' count on every island. */
export type PenguinSpeciesCount = Omit<PenguinCount, 'sex'> & { speciesTotal: number };

const sumCounts = (rows: PenguinCount[]) => rows.reduce((sum, d) => sum + d.count, 0);

export const PENGUIN_COUNTS: PenguinSpeciesCount[] = PENGUIN_SPECIES.flatMap((species) => {
	const speciesRows = PENGUIN_COUNTS_BY_SEX.filter((d) => d.species === species);
	return PENGUIN_ISLANDS.map((island) => ({
		species,
		island,
		count: sumCounts(speciesRows.filter((d) => d.island === island)),
		speciesTotal: sumCounts(speciesRows)
	}));
});
