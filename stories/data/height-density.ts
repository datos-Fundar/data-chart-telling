// Illustrative height densities for the AreaPlot stories. Generated in code, not
// real statistics: one normal curve per sex.

export type HeightDensity = { height: number; sex: 'male' | 'female'; density: number };

const normal = (x: number, mean: number, sd: number) =>
	Math.exp(-((x - mean) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));

/** Height density per centimetre, as a percent - one normal curve per sex. */
export const HEIGHT_DENSITY: HeightDensity[] = Array.from(
	{ length: 61 },
	(_, i) => 140 + i
).flatMap((height) => [
	{ height, sex: 'male' as const, density: Math.round(normal(height, 175, 7) * 10000) / 100 },
	{ height, sex: 'female' as const, density: Math.round(normal(height, 162, 6.5) * 10000) / 100 }
]);

export const MALE_HEIGHT_DENSITY = HEIGHT_DENSITY.filter((d) => d.sex === 'male');
export const FEMALE_HEIGHT_DENSITY = HEIGHT_DENSITY.filter((d) => d.sex === 'female');
