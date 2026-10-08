// Flat time-series rows - one row per (region, metric, year) observation -
// used by the line/bar/tooltip/configuration/composition stories that show
// grouped or faceted series over time.

export type SeriesPoint = {
	year: number;
	region: string; // facet dimension
	metric: string; // color (grouping) dimension
	value: number;
};

const REGIONS = ['North', 'South'] as const;
const METRICS = ['GDP', 'Employment'] as const;

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
			value: wave(ri * 2 + mi + 1, year)
		}))
	)
);
