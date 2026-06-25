export type YearPoint = { year: number; value: number };
export type MonthPoint = { month: string; value: number };

export const GDP: YearPoint[] = [
  { year: 2018, value: 42 },
  { year: 2019, value: 48 },
  { year: 2020, value: 31 },
  { year: 2021, value: 55 },
  { year: 2022, value: 61 },
];

export const EMPLOYMENT: YearPoint[] = [
  { year: 2018, value: 72 },
  { year: 2019, value: 74 },
  { year: 2020, value: 60 },
  { year: 2021, value: 68 },
  { year: 2022, value: 75 },
];

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
