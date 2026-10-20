// Illustrative commute times for the box plot stories. Generated in code with
// a fixed seed, not real observations: one-way trips in minutes, by mode of
// transport, in two cities, skewed right with a few very long trips.

export type CommuteMode = 'Walk' | 'Bike' | 'Bus' | 'Train' | 'Car';

export type CommuteTrip = { city: 'Buenos Aires' | 'Córdoba'; mode: CommuteMode; minutes: number };

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

const random = mulberry32(7);

/** One log-normal draw around `median` minutes, by the Box-Muller transform. */
const trip = (median: number, spread: number) => {
	const u = 1 - random();
	const v = random();
	const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	return Math.round(median * Math.exp(spread * z));
};

/** Each mode's median trip, in minutes, and how widely trips spread around it. */
const MODES: [CommuteMode, number, number][] = [
	['Walk', 15, 0.35],
	['Bike', 22, 0.3],
	['Bus', 45, 0.4],
	['Train', 50, 0.3],
	['Car', 35, 0.45]
];

const sample = (city: CommuteTrip['city'], scale: number, n: number): CommuteTrip[] =>
	MODES.flatMap(([mode, median, spread]) =>
		Array.from({ length: n }, () => ({ city, mode, minutes: trip(median * scale, spread) }))
	);

/** Buenos Aires trips run longer than Córdoba's, for every mode. */
export const COMMUTE_TRIPS: CommuteTrip[] = [
	...sample('Buenos Aires', 1.2, 60),
	...sample('Córdoba', 0.85, 40)
];

/** Buenos Aires trips alone. */
export const BUENOS_AIRES_TRIPS = COMMUTE_TRIPS.filter((d) => d.city === 'Buenos Aires');
