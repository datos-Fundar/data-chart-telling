// ── Napoleon's march on Moscow, 1812 ────────────────────────────────────────
// Data for Charles Joseph Minard's 1812 map of Napoleon's Russian campaign,
// from stdlib's `datasets-minard-napoleons-march`
// (https://github.com/stdlib-js/datasets-minard-napoleons-march; the data is
// CC0 / PDDL). The army's size, direction and position along the march to
// Moscow and the retreat, the cities it passed, where Minard wrote the size,
// and the temperature on the way back. The map's rivers are
// `napoleons-rivers`.
//
// One change to stdlib's army rows, to match R's `HistData::Minard`: each
// division's advance ends at the point its retreat starts from (Moscow for
// division 1), which stdlib leaves out, so a trail of each direction reaches
// the other. Division 1's retreat then leaves from (37.7, 55.7), a little off
// the advance's end - as Minard drew it, the two ribbons run side by side
// there instead of meeting at a point.

export type NapoleonsArmyRow = {
	lon: number;
	lat: number;
	/** Soldiers still marching at this point. */
	size: number;
	/** `'A'` advance (toward Moscow), `'R'` retreat. */
	direction: 'A' | 'R';
	/** Which of the three army columns this row belongs to. */
	division: 1 | 2 | 3;
};

export type NapoleonsCity = { lon: number; lat: number; city: string };

/** An army size printed on Minard's map, at a position beside its trail. The labels follow the march; `NAPOLEONS_LABEL_ROWS` says where. Includes two sizes (400,000 and 14,000) that stdlib's labels lack. */
export type NapoleonsSizeLabel = { lon: number; lat: number; size: number; division: 1 | 2 | 3 };

/** The temperature (°C) on the retreat, at a longitude and date. */
export type NapoleonsTemperature = { lon: number; temp: number; date: string };

export const NAPOLEONS_ARMY: NapoleonsArmyRow[] = [
	{ lon: 24.0, lat: 54.9, size: 340000, direction: 'A', division: 1 },
	{ lon: 24.5, lat: 55.0, size: 340000, direction: 'A', division: 1 },
	{ lon: 25.5, lat: 54.5, size: 340000, direction: 'A', division: 1 },
	{ lon: 26.0, lat: 54.7, size: 320000, direction: 'A', division: 1 },
	{ lon: 27.0, lat: 54.8, size: 300000, direction: 'A', division: 1 },
	{ lon: 28.0, lat: 54.9, size: 280000, direction: 'A', division: 1 },
	{ lon: 28.5, lat: 55.0, size: 240000, direction: 'A', division: 1 },
	{ lon: 29.0, lat: 55.1, size: 210000, direction: 'A', division: 1 },
	{ lon: 30.0, lat: 55.2, size: 180000, direction: 'A', division: 1 },
	{ lon: 30.3, lat: 55.3, size: 175000, direction: 'A', division: 1 },
	{ lon: 32.0, lat: 54.8, size: 145000, direction: 'A', division: 1 },
	{ lon: 33.2, lat: 54.9, size: 140000, direction: 'A', division: 1 },
	{ lon: 34.4, lat: 55.5, size: 127100, direction: 'A', division: 1 },
	{ lon: 35.5, lat: 55.4, size: 100000, direction: 'A', division: 1 },
	{ lon: 36.0, lat: 55.5, size: 100000, direction: 'A', division: 1 },
	{ lon: 37.6, lat: 55.8, size: 100000, direction: 'A', division: 1 },
	{ lon: 37.7, lat: 55.7, size: 100000, direction: 'R', division: 1 },
	{ lon: 37.5, lat: 55.7, size: 98000, direction: 'R', division: 1 },
	{ lon: 37.0, lat: 55.0, size: 97000, direction: 'R', division: 1 },
	{ lon: 36.8, lat: 55.0, size: 96000, direction: 'R', division: 1 },
	{ lon: 35.4, lat: 55.3, size: 87000, direction: 'R', division: 1 },
	{ lon: 34.3, lat: 55.2, size: 55000, direction: 'R', division: 1 },
	{ lon: 33.3, lat: 54.8, size: 37000, direction: 'R', division: 1 },
	{ lon: 32.0, lat: 54.6, size: 24000, direction: 'R', division: 1 },
	{ lon: 30.4, lat: 54.4, size: 20000, direction: 'R', division: 1 },
	{ lon: 29.2, lat: 54.4, size: 20000, direction: 'R', division: 1 },
	{ lon: 28.5, lat: 54.3, size: 20000, direction: 'R', division: 1 },
	{ lon: 28.3, lat: 54.4, size: 20000, direction: 'R', division: 1 },
	{ lon: 24.0, lat: 55.1, size: 60000, direction: 'A', division: 2 },
	{ lon: 24.5, lat: 55.2, size: 60000, direction: 'A', division: 2 },
	{ lon: 25.5, lat: 54.7, size: 60000, direction: 'A', division: 2 },
	{ lon: 26.6, lat: 55.7, size: 40000, direction: 'A', division: 2 },
	{ lon: 27.4, lat: 55.6, size: 33000, direction: 'A', division: 2 },
	{ lon: 28.7, lat: 55.5, size: 33000, direction: 'A', division: 2 },
	{ lon: 28.7, lat: 55.5, size: 33000, direction: 'R', division: 2 },
	{ lon: 29.2, lat: 54.3, size: 30000, direction: 'R', division: 2 },
	{ lon: 28.5, lat: 54.2, size: 30000, direction: 'R', division: 2 },
	{ lon: 28.3, lat: 54.3, size: 28000, direction: 'R', division: 2 },
	{ lon: 27.5, lat: 54.5, size: 20000, direction: 'R', division: 2 },
	{ lon: 26.8, lat: 54.3, size: 12000, direction: 'R', division: 2 },
	{ lon: 26.4, lat: 54.4, size: 14000, direction: 'R', division: 2 },
	{ lon: 24.6, lat: 54.5, size: 8000, direction: 'R', division: 2 },
	{ lon: 24.4, lat: 54.4, size: 4000, direction: 'R', division: 2 },
	{ lon: 24.2, lat: 54.4, size: 4000, direction: 'R', division: 2 },
	{ lon: 24.1, lat: 54.3, size: 4000, direction: 'R', division: 2 },
	{ lon: 24.0, lat: 55.2, size: 22000, direction: 'A', division: 3 },
	{ lon: 24.5, lat: 55.3, size: 22000, direction: 'A', division: 3 },
	{ lon: 24.6, lat: 55.8, size: 6000, direction: 'A', division: 3 },
	{ lon: 24.6, lat: 55.8, size: 6000, direction: 'R', division: 3 },
	{ lon: 24.2, lat: 54.4, size: 6000, direction: 'R', division: 3 },
	{ lon: 24.1, lat: 54.3, size: 6000, direction: 'R', division: 3 }
];

export const NAPOLEONS_CITIES: NapoleonsCity[] = [
	{ lon: 24.0, lat: 55.0, city: 'Kowno' },
	{ lon: 25.3, lat: 54.7, city: 'Wilna' },
	{ lon: 26.4, lat: 54.4, city: 'Smorgoni' },
	{ lon: 26.8, lat: 54.3, city: 'Molodexno' },
	{ lon: 27.7, lat: 55.2, city: 'Gloubokoe' },
	{ lon: 27.6, lat: 53.9, city: 'Minsk' },
	{ lon: 28.5, lat: 54.3, city: 'Studienska' },
	{ lon: 28.7, lat: 55.5, city: 'Polotzk' },
	{ lon: 29.2, lat: 54.4, city: 'Bobr' },
	{ lon: 30.2, lat: 55.3, city: 'Witebsk' },
	{ lon: 30.4, lat: 54.5, city: 'Orscha' },
	{ lon: 30.4, lat: 53.9, city: 'Mohilow' },
	{ lon: 32.0, lat: 54.8, city: 'Smolensk' },
	{ lon: 33.2, lat: 54.9, city: 'Dorogobouge' },
	{ lon: 34.3, lat: 55.2, city: 'Wixma' },
	{ lon: 34.4, lat: 55.5, city: 'Chjat' },
	{ lon: 36.0, lat: 55.5, city: 'Mojaisk' },
	{ lon: 37.6, lat: 55.8, city: 'Moscou' },
	{ lon: 36.6, lat: 55.3, city: 'Tarantino' },
	{ lon: 36.5, lat: 55.0, city: 'Malo-Jarosewli' }
];

export const NAPOLEONS_SIZE_LABELS: NapoleonsSizeLabel[] = [
	{ lon: 24.0, lat: 54.9, size: 422000, division: 1 },
	{ lon: 24.5, lat: 55.0, size: 400000, division: 1 },
	{ lon: 30.3, lat: 55.3, size: 175000, division: 1 },
	{ lon: 32.0, lat: 54.8, size: 145000, division: 1 },
	{ lon: 34.4, lat: 55.5, size: 127100, division: 1 },
	{ lon: 35.5, lat: 55.4, size: 100000, division: 1 },
	{ lon: 37.7, lat: 55.7, size: 100000, division: 1 },
	{ lon: 36.8, lat: 55.0, size: 96000, division: 1 },
	{ lon: 35.4, lat: 55.3, size: 87000, division: 1 },
	{ lon: 34.3, lat: 55.2, size: 55000, division: 1 },
	{ lon: 33.3, lat: 54.8, size: 37000, division: 1 },
	{ lon: 32.0, lat: 54.6, size: 24000, division: 1 },
	{ lon: 30.4, lat: 54.4, size: 20000, division: 1 },
	{ lon: 26.6, lat: 55.7, size: 60000, division: 2 },
	{ lon: 28.7, lat: 55.5, size: 33000, division: 2 },
	{ lon: 29.2, lat: 54.3, size: 50000, division: 1 },
	{ lon: 28.5, lat: 54.2, size: 28000, division: 1 },
	{ lon: 26.8, lat: 54.3, size: 12000, division: 1 },
	{ lon: 26.4, lat: 54.4, size: 14000, division: 2 },
	{ lon: 25.0, lat: 54.4, size: 8000, division: 1 },
	{ lon: 24.4, lat: 54.4, size: 4000, division: 1 },
	{ lon: 24.5, lat: 55.3, size: 22000, division: 3 },
	{ lon: 24.1, lat: 54.4, size: 10000, division: 1 },
	{ lon: 24.6, lat: 55.8, size: 6000, division: 3 }
];

/**
 * The army row each label is printed at, so the label is shown once the march
 * reaches it: `NAPOLEONS_SIZE_LABELS[0]` goes with `NAPOLEONS_ARMY[NAPOLEONS_LABEL_ROWS[0]]`,
 * and so on. Set by hand against the original Minard's map.
 */
export const NAPOLEONS_LABEL_ROWS: number[] = [
	0, // 422,000
	1, // 400,000
	9, // 175,000
	10, // 145,000
	12, // 127,100
	13, // 100,000
	16, // 100,000
	19, // 96,000
	20, // 87,000
	21, // 55,000
	22, // 37,000
	23, // 24,000
	24, // 20,000
	31, // 60,000
	33, // 33,000
	35, // 50,000
	37, // 28,000
	39, // 12,000
	40, // 14,000
	41, // 8,000
	42, // 4,000
	46, // 22,000
	47, // 10,000
	50 // 6,000
];

export const NAPOLEONS_TEMPERATURES: NapoleonsTemperature[] = [
	{ lon: 37.6, temp: 0, date: '18 Oct 1812' },
	{ lon: 36.0, temp: 0, date: '24 Oct 1812' },
	{ lon: 33.2, temp: -9, date: '09 Nov 1812' },
	{ lon: 32.0, temp: -21, date: '14 Nov 1812' },
	{ lon: 29.2, temp: -11, date: '24 Nov 1812' },
	{ lon: 28.5, temp: -20, date: '28 Nov 1812' },
	{ lon: 27.2, temp: -24, date: '01 Dec 1812' },
	{ lon: 26.7, temp: -30, date: '06 Dec 1812' },
	{ lon: 25.3, temp: -26, date: '07 Dec 1812' }
];
