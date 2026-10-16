// Charles Minard's 1812 map of Napoleon's Russian campaign - troop position,
// size and direction along the march to Moscow and the retreat. Data from the
// R package `HistData` (https://friendly.github.io/HistData/reference/Minard.html),
// the same dataset svelteplot's own `trail/napoleon` example uses
// (https://svelteplot.dev/examples/trail/napoleon).

export type MinardRow = {
	long: number;
	lat: number;
	survivors: number;
	/** `'A'` advance (toward Moscow), `'R'` retreat. */
	direction: 'A' | 'R';
	/** Which of the three army columns this row belongs to - keeps the trails from connecting across columns. */
	group: '1' | '2' | '3';
};

export const MINARD_TROOPS: MinardRow[] = [
	{ long: 24, lat: 54.9, survivors: 340000, direction: 'A', group: '1' },
	{ long: 24.5, lat: 55, survivors: 340000, direction: 'A', group: '1' },
	{ long: 25.5, lat: 54.5, survivors: 340000, direction: 'A', group: '1' },
	{ long: 26, lat: 54.7, survivors: 320000, direction: 'A', group: '1' },
	{ long: 27, lat: 54.8, survivors: 300000, direction: 'A', group: '1' },
	{ long: 28, lat: 54.9, survivors: 280000, direction: 'A', group: '1' },
	{ long: 28.5, lat: 55, survivors: 240000, direction: 'A', group: '1' },
	{ long: 29, lat: 55.1, survivors: 210000, direction: 'A', group: '1' },
	{ long: 30, lat: 55.2, survivors: 180000, direction: 'A', group: '1' },
	{ long: 30.3, lat: 55.3, survivors: 175000, direction: 'A', group: '1' },
	{ long: 32, lat: 54.8, survivors: 145000, direction: 'A', group: '1' },
	{ long: 33.2, lat: 54.9, survivors: 140000, direction: 'A', group: '1' },
	{ long: 34.4, lat: 55.5, survivors: 127100, direction: 'A', group: '1' },
	{ long: 35.5, lat: 55.4, survivors: 100000, direction: 'A', group: '1' },
	{ long: 36, lat: 55.5, survivors: 100000, direction: 'A', group: '1' },
	{ long: 37.6, lat: 55.8, survivors: 100000, direction: 'A', group: '1' },
	{ long: 37.7, lat: 55.7, survivors: 100000, direction: 'R', group: '1' },
	{ long: 37.5, lat: 55.7, survivors: 98000, direction: 'R', group: '1' },
	{ long: 37, lat: 55, survivors: 97000, direction: 'R', group: '1' },
	{ long: 36.8, lat: 55, survivors: 96000, direction: 'R', group: '1' },
	{ long: 35.4, lat: 55.3, survivors: 87000, direction: 'R', group: '1' },
	{ long: 34.3, lat: 55.2, survivors: 55000, direction: 'R', group: '1' },
	{ long: 33.3, lat: 54.8, survivors: 37000, direction: 'R', group: '1' },
	{ long: 32, lat: 54.6, survivors: 24000, direction: 'R', group: '1' },
	{ long: 30.4, lat: 54.4, survivors: 20000, direction: 'R', group: '1' },
	{ long: 29.2, lat: 54.3, survivors: 20000, direction: 'R', group: '1' },
	{ long: 28.5, lat: 54.2, survivors: 20000, direction: 'R', group: '1' },
	{ long: 28.3, lat: 54.3, survivors: 20000, direction: 'R', group: '1' },
	{ long: 27.5, lat: 54.5, survivors: 20000, direction: 'R', group: '1' },
	{ long: 26.8, lat: 54.3, survivors: 12000, direction: 'R', group: '1' },
	{ long: 26.4, lat: 54.4, survivors: 14000, direction: 'R', group: '1' },
	{ long: 25, lat: 54.4, survivors: 8000, direction: 'R', group: '1' },
	{ long: 24.4, lat: 54.4, survivors: 4000, direction: 'R', group: '1' },
	{ long: 24.2, lat: 54.4, survivors: 4000, direction: 'R', group: '1' },
	{ long: 24.1, lat: 54.4, survivors: 4000, direction: 'R', group: '1' },
	{ long: 24, lat: 55.1, survivors: 60000, direction: 'A', group: '2' },
	{ long: 24.5, lat: 55.2, survivors: 60000, direction: 'A', group: '2' },
	{ long: 25.5, lat: 54.7, survivors: 60000, direction: 'A', group: '2' },
	{ long: 26.6, lat: 55.7, survivors: 40000, direction: 'A', group: '2' },
	{ long: 27.4, lat: 55.6, survivors: 33000, direction: 'A', group: '2' },
	{ long: 28.7, lat: 55.5, survivors: 33000, direction: 'A', group: '2' },
	{ long: 28.7, lat: 55.5, survivors: 33000, direction: 'R', group: '2' },
	{ long: 29.2, lat: 54.2, survivors: 30000, direction: 'R', group: '2' },
	{ long: 28.5, lat: 54.1, survivors: 30000, direction: 'R', group: '2' },
	{ long: 28.3, lat: 54.2, survivors: 28000, direction: 'R', group: '2' },
	{ long: 24, lat: 55.2, survivors: 22000, direction: 'A', group: '3' },
	{ long: 24.5, lat: 55.3, survivors: 22000, direction: 'A', group: '3' },
	{ long: 24.6, lat: 55.8, survivors: 6000, direction: 'A', group: '3' },
	{ long: 24.6, lat: 55.8, survivors: 6000, direction: 'R', group: '3' },
	{ long: 24.2, lat: 54.4, survivors: 6000, direction: 'R', group: '3' },
	{ long: 24.1, lat: 54.4, survivors: 6000, direction: 'R', group: '3' }
];

export type MinardCityLabel = { name: string; lon: number; lat: number };

/** Country labels rendered on the map (not part of the original CSV) - the same five svelteplot's own example places by hand. */
export const MINARD_COUNTRY_LABELS: MinardCityLabel[] = [
	{ name: 'Russia', lon: 33.4, lat: 56 },
	{ name: 'Belarus', lon: 27.9534, lat: 53.7098 },
	{ name: 'Estonia', lon: 25.0136, lat: 58.5953 },
	{ name: 'Latvia', lon: 25.2, lat: 56.8796 },
	{ name: 'Lithuania', lon: 24.5, lat: 55.7 }
];
