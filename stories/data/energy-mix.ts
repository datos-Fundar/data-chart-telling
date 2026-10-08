// Illustrative energy mix for the AreaPlot stories. Generated in code, not real
// statistics: a set of smooth shares that sum to 100 each year.

export type EnergyShare = { year: number; source: string; share: number };

const SOURCES = [
	{ name: 'coal', start: 38, end: 12, wave: 3 },
	{ name: 'gas', start: 20, end: 34, wave: 2 },
	{ name: 'nuclear', start: 12, end: 9, wave: 1 },
	{ name: 'hydro', start: 15, end: 14, wave: 2 },
	{ name: 'renewables', start: 4, end: 25, wave: 1.5 }
];

const YEARS = Array.from({ length: 21 }, (_, i) => 2000 + i);

/** Each year's source shares, normalized to sum to 100 - a whole split into parts. */
export const ENERGY_MIX: EnergyShare[] = YEARS.flatMap((year) => {
	const t = (year - 2000) / 20;
	const raw = SOURCES.map((s) => ({
		source: s.name,
		value: s.start + (s.end - s.start) * t + s.wave * Math.sin(t * Math.PI * 2 + s.start)
	}));
	const total = raw.reduce((sum, r) => sum + r.value, 0);
	// Whole-percent shares, rounded by largest remainder so each year sums to
	// exactly 100. Integers add up exactly in floating point, so a stacked total
	// never lands a hair above 100 and pushes the y-axis to the next tick.
	const exact = raw.map((r) => (r.value * 100) / total);
	const shares = exact.map(Math.floor);
	const missing = 100 - shares.reduce((sum, t) => sum + t, 0);
	exact
		.map((v, i) => i)
		.sort((a, b) => exact[b] - shares[b] - (exact[a] - shares[a]))
		.slice(0, missing)
		.forEach((i) => (shares[i] += 1));
	return raw.map((r, i) => ({ year, source: r.source, share: shares[i] }));
});
