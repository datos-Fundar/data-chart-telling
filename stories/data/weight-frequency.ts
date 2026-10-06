// Illustrative weight frequencies for the stack stories: how many people fall in
// each 2 kg bin, per sex. Generated in code from two normal curves, not real
// statistics. Used where a centered stack reads as a mirrored silhouette.

export type WeightFrequency = { weight: number; sex: 'female' | 'male'; frequency: number };

const normal = (x: number, mean: number, sd: number) =>
	Math.exp(-((x - mean) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));

const BIN_WIDTH = 2;
const WEIGHTS = Array.from({ length: 57 }, (_, i) => 34 + i * BIN_WIDTH);

const curve = (sex: WeightFrequency['sex'], people: number, mean: number, sd: number) =>
	WEIGHTS.map((weight) => ({
		weight,
		sex,
		frequency: Math.round(people * normal(weight, mean, sd) * BIN_WIDTH)
	}));

/** One curve per sex: women centred lower and narrower, men higher and wider. */
export const WEIGHT_FREQUENCY: WeightFrequency[] = [
	...curve('female', 6000, 62, 9),
	...curve('male', 6000, 76, 11)
];

/** The tallest total of both sexes in one bin, so a centered stack's domain can fit it. */
export const WEIGHT_PEAK_TOTAL = Math.max(
	...WEIGHTS.map((weight) =>
		WEIGHT_FREQUENCY.filter((d) => d.weight === weight).reduce((sum, d) => sum + d.frequency, 0)
	)
);
