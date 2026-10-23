// ── Height density by sex ───────────────────────────────────────────────────
// A Gaussian kernel density estimate of the adult heights in `heights.ts`, one
// curve per sex, each with its own Silverman bandwidth.

import { HEIGHTS } from './heights';

export type HeightDensity = { height: number; sex: 'male' | 'female'; density: number };

const kernel = (distance: number) => Math.exp(-(distance ** 2) / 2) / Math.sqrt(2 * Math.PI);

const silvermanBandwidth = (values: number[]) => {
	const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
	const deviation = Math.sqrt(
		values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1)
	);
	return 1.06 * deviation * values.length ** -0.2;
};

const densityAt = (values: number[], bandwidth: number, height: number) =>
	values.reduce((sum, value) => sum + kernel((height - value) / bandwidth), 0) /
	(values.length * bandwidth);

const GRID = Array.from({ length: 61 }, (_, index) => 125 + index);

/** Height density per centimeter, as a percent - one curve per sex, every centimeter from 125 to 185. */
export const HEIGHT_DENSITY: HeightDensity[] = (['male', 'female'] as const).flatMap((sex) => {
	const heights = HEIGHTS.filter(({ group }) => group === sex).map(({ height }) => height);
	const bandwidth = silvermanBandwidth(heights);
	return GRID.map((height) => ({
		height,
		sex,
		density: Math.round(densityAt(heights, bandwidth, height) * 10000) / 100
	}));
});

export const MALE_HEIGHT_DENSITY = HEIGHT_DENSITY.filter((d) => d.sex === 'male');
export const FEMALE_HEIGHT_DENSITY = HEIGHT_DENSITY.filter((d) => d.sex === 'female');
