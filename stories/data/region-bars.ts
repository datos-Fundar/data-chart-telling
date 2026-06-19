// Flat categorical bars over a few years — used by the BarChart stories.

export type RegionYear = { year: number; region: string; value: number };

export const REGION_BARS: RegionYear[] = [2018, 2020, 2022].flatMap((year) =>
  ['Norte', 'Centro', 'Sur', 'Este', 'Oeste'].map((region, i) => ({
    year,
    region,
    value: Math.round(30 + 10 * i + 6 * Math.sin(year - 2018 + i)),
  })),
);
