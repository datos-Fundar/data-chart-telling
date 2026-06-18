// Shared datasets for the chart-level stories. Everything is intentionally
// *flat* — one row per observation — because the chart components take flat data
// and derive series/groups/facets from the `x` / `y` / `z` / facet encodings.

// ── Time series, grouped + faceted ──────────────────────────────────────────────
export type SeriesPoint = {
  year: number;
  region: string; // facet dimension
  metric: string; // z (grouping) dimension
  value: number;
};

const REGIONS = ['Norte', 'Sur'] as const;
const METRICS = ['PBI', 'Empleo'] as const;

// Deterministic pseudo-data so stories are stable.
function wave(seed: number, year: number): number {
  return Math.round(40 + 20 * Math.sin((year - 2018 + seed) * 0.9) + seed * 8);
}

export const TIME_SERIES: SeriesPoint[] = REGIONS.flatMap((region, ri) =>
  METRICS.flatMap((metric, mi) =>
    [2018, 2019, 2020, 2021, 2022].map((year) => ({
      year,
      region,
      metric,
      value: wave(ri * 2 + mi + 1, year),
    })),
  ),
);

export const METRIC_COLORS: Record<string, string> = {
  PBI: '#4f46e5',
  Empleo: '#e6580d',
};

// ── Categorical bars over time ──────────────────────────────────────────────────
export type RegionYear = { year: number; region: string; value: number };

export const REGION_BARS: RegionYear[] = [2018, 2020, 2022].flatMap((year) =>
  ['Norte', 'Centro', 'Sur', 'Este', 'Oeste'].map((region, i) => ({
    year,
    region,
    value: Math.round(30 + 10 * i + 6 * Math.sin(year - 2018 + i)),
  })),
);

// ── Heatmap cells over time, with a facet dimension ─────────────────────────────
export type HeatCell = {
  year: number;
  scenario: string; // facet dimension
  rooms: number; // x
  people: number; // y
  pct: number; // value
};

export const HEAT_CELLS: HeatCell[] = ['Base', 'Proyectado'].flatMap((scenario, si) =>
  [1991, 2001, 2010, 2022].flatMap((year, yi) =>
    [1, 2, 3, 4].flatMap((rooms) =>
      [1, 2, 3, 4].map((people) => {
        const closeness = 4 - Math.abs(rooms - people);
        const drift = (yi + si) * 0.6;
        return {
          year,
          scenario,
          rooms,
          people,
          pct: Math.max(0, Math.round((closeness + drift) * 3)) / 100,
        };
      }),
    ),
  ),
);
