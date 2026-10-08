export type YearPoint = { year: number; value: number };
export type MonthPoint = { month: string; value: number };

export type LifeExpectancyPoint = {
  year: number;
  value: number;
  sex: 'male' | 'female';
  region: string
};

export const LIFE_EXPECTANCY: LifeExpectancyPoint[] = [
  { year: 2008, value: 74.5, sex: 'male', region: 'Argentina' },
  { year: 2008, value: 77.9, sex: 'female', region: 'Argentina' },
  { year: 2009, value: 75.5, sex: 'male', region: 'Argentina' },
  { year: 2009, value: 79.9, sex: 'female', region: 'Argentina' },
  { year: 2010, value: 76.4, sex: 'male', region: 'Argentina' },
  { year: 2010, value: 81.0, sex: 'female', region: 'Argentina' },
  { year: 2012, value: 77.1, sex: 'male', region: 'Argentina' },
  { year: 2012, value: 82.4, sex: 'female', region: 'Argentina' },
  { year: 2014, value: 77.8, sex: 'male', region: 'Argentina' },
  { year: 2014, value: 83.0, sex: 'female', region: 'Argentina' },
  { year: 2016, value: 78.3, sex: 'male', region: 'Argentina' },
  { year: 2016, value: 83.4, sex: 'female', region: 'Argentina' },
  { year: 2018, value: 78.7, sex: 'male', region: 'Argentina' },
  { year: 2018, value: 83.7, sex: 'female', region: 'Argentina' },
  { year: 2020, value: 79.1, sex: 'male', region: 'Argentina' },
  { year: 2020, value: 84.0, sex: 'female', region: 'Argentina' },
];

export const FEMALE_LIFE_EXPECTANCY: YearPoint[] = LIFE_EXPECTANCY
  .filter((d) => d.sex === 'female')
  .map((d) => ({ year: d.year, value: d.value }));

export const MALE_LIFE_EXPECTANCY: YearPoint[] = LIFE_EXPECTANCY
  .filter((d) => d.sex === 'male')
  .map((d) => ({ year: d.year, value: d.value }));

export type YearPointWithGaps = { year: number; value: number | null };

/**
 * `FEMALE_LIFE_EXPECTANCY` with three holes - the first year (start), one
 * internal year bounded by real data on both sides (middle), and the last
 * year (end) - used to demonstrate `LinePlot`'s `styles.gaps` fill on the
 * same series every other LinePlot story already uses.
 */
export const FEMALE_LIFE_EXPECTANCY_WITH_GAPS: YearPointWithGaps[] = FEMALE_LIFE_EXPECTANCY.map((d, i) =>
  i === 0 || i === 3 || i === FEMALE_LIFE_EXPECTANCY.length - 1 ? { year: d.year, value: null } : d,
);

/**
 * `MALE_LIFE_EXPECTANCY` with a single hole in a different place than
 * `FEMALE_LIFE_EXPECTANCY_WITH_GAPS` - for series-aware `styles.gaps` demos
 * (a named entry vs. `'default'`).
 */
export const MALE_LIFE_EXPECTANCY_WITH_GAPS: YearPointWithGaps[] = MALE_LIFE_EXPECTANCY.map((d, i) =>
  i === 4 ? { year: d.year, value: null } : d,
);
