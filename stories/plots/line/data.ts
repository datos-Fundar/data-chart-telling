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

export const COSTS: YearPoint[] = [
  { year: 2018, value: 30 },
  { year: 2019, value: 35 },
  { year: 2020, value: 28 },
  { year: 2021, value: 40 },
  { year: 2022, value: 45 },
];

export const MONTHLY: MonthPoint[] = [
  { month: '2024-01', value: 25 },
  { month: '2024-02', value: 30 },
  { month: '2024-03', value: 35 },
  { month: '2024-04', value: 28 },
  { month: '2024-05', value: 42 },
  { month: '2024-06', value: 38 },
];
