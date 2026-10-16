// Illustrative daily weather for the window, bollinger, map, shift, interval,
// group and select stories. Generated in code with a fixed seed, not real
// observations: a seasonal temperature curve per city plus day-to-day noise, and
// rain on some days, over 2025.

export type DailyTemperature = {
	date: Date;
	day: number;
	city: string;
	temp: number;
	rain: number;
};

/** A small seeded PRNG, so every run draws the same noise. */
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

/**
 * Each city's yearly mean, its seasonal swing, how noisy a day is, and how often
 * and how hard it rains. Southern hemisphere: warmest in January.
 */
const CITIES = [
	{ city: 'Buenos Aires', mean: 18, swing: 7, noise: 3, rainChance: 0.25, rainMax: 30 },
	{ city: 'Ushuaia', mean: 6, swing: 5, noise: 2.5, rainChance: 0.45, rainMax: 8 }
];

const DAYS = 365;

/** One row per city per day of 2025. */
export const DAILY_TEMPERATURE: DailyTemperature[] = CITIES.flatMap(
	({ city, mean, swing, noise, rainChance, rainMax }) =>
		Array.from({ length: DAYS }, (_, day) => {
			const seasonal = mean + swing * Math.cos((2 * Math.PI * (day - 15)) / DAYS);
			return {
				date: new Date(2025, 0, 1 + day),
				day,
				city,
				temp: Math.round((seasonal + (random() - 0.5) * 2 * noise) * 10) / 10,
				rain: random() < rainChance ? Math.round(random() * rainMax * 10) / 10 : 0
			};
		})
);

/** Buenos Aires alone, for the single-series stories. */
export const BUENOS_AIRES_TEMPERATURE = DAILY_TEMPERATURE.filter((d) => d.city === 'Buenos Aires');
