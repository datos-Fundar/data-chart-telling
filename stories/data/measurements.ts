// Illustrative raw measurements for the histogram and bin stories. Generated in
// code with a fixed seed, not real observations: two groups, each a normal
// sample of a length and a weight.

export type Measurement = { value: number; weight: number; group: 'A' | 'B' };

/** A small seeded PRNG, so every run draws the same sample. */
function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const random = mulberry32(42);

/** One normal draw, by the Box-Muller transform. */
const normal = (mean: number, sd: number) => {
	const u = 1 - random();
	const v = random();
	return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const sample = (group: 'A' | 'B', n: number, mean: number, sd: number): Measurement[] =>
	Array.from({ length: n }, () => ({
		value: Math.round(normal(mean, sd) * 10) / 10,
		weight: Math.round(Math.max(1, normal(mean * 1.4, 6)) * 10) / 10,
		group
	}));

/** Group A is centred lower than group B, so grouping shows two overlapping shapes. */
export const MEASUREMENTS: Measurement[] = [...sample('A', 160, 30, 6), ...sample('B', 120, 40, 5)];
