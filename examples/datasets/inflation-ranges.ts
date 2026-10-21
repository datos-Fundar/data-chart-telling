// ── Monthly inflation by region and year ────────────────────────────────────
// The monthly series, summarized per region and year: the mean of the monthly
// changes and the lowest and highest month. 2026 holds the eight months so far.

import { INFLATION_BY_REGION, MONTHS } from './inflation-by-region';

export type InflationRange = {
	period: string;
	region: string;
	year: number;
	mean: number;
	min: number;
	max: number;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

export const INFLATION_RANGES: InflationRange[] = INFLATION_BY_REGION.flatMap(
	({ region, inflation }) =>
		[2023, 2024, 2025, 2026].map((year) => {
			const months = MONTHS.flatMap((date, monthIndex) =>
				date.getUTCFullYear() === year ? [inflation[monthIndex]] : []
			);
			const mean = months.reduce((sum, value) => sum + value, 0) / months.length;
			return {
				period: `${region} ${year}`,
				region,
				year,
				mean: round1(mean),
				min: Math.min(...months),
				max: Math.max(...months)
			};
		})
);
