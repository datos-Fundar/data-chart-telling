// ── Monthly inflation by region ─────────────────────────────────────────────
// INDEC, consumer price index (IPC, base December 2016), via the datos.gob.ar
// series API. Change from the previous month, in percent, January 2023 to
// August 2026.

export type RegionRow = { date: Date; region: string; value: number };

export const MONTHS = Array.from(
	{ length: 44 },
	(_, monthIndex) => new Date(Date.UTC(2023, monthIndex, 1))
);

export const INFLATION_BY_REGION = [
	{
		region: 'GBA',
		inflation: [
			6, 6.7, 7.8, 8.6, 8, 5.8, 6.2, 12.3, 12.2, 8.6, 12.9, 25.1, 19.6, 15, 11.5, 9.2, 4.3, 4.4, 4,
			4.1, 3.7, 2.8, 2.6, 2.9, 2, 2.2, 3.9, 2.8, 1.5, 2, 1.9, 1.9, 2.1, 2.4, 2.5, 2.8, 2.8, 2.6,
			3.4, 2.8, 2.3, 1.9, 2.3, 1.6
		]
	},
	{
		region: 'Cuyo',
		inflation: [
			6.4, 6.7, 7.9, 7.2, 7.5, 5.3, 6.3, 12.3, 13.7, 7.4, 12.8, 25.8, 22.3, 13.5, 9.3, 8.1, 4.3,
			5.1, 4.6, 4.5, 3, 2.2, 2.1, 2.3, 2, 2.7, 3.5, 2.9, 1.6, 1, 1.9, 2.1, 2.2, 2.3, 2.8, 3, 3, 3.4,
			3.2, 2.1, 2.1, 1.6, 1.9, 1.7
		]
	},
	{
		region: 'Northwest',
		inflation: [
			6.3, 7.3, 7.3, 7.7, 8, 6.6, 6.1, 13.7, 13.2, 7.7, 11.8, 25.2, 21.7, 11.7, 8.8, 9.1, 4.2, 4.8,
			3.6, 5, 3.4, 2.6, 1.9, 2.7, 2.6, 2.6, 4.3, 2.9, 1.2, 1.2, 1.7, 2, 2.2, 2.1, 2.3, 2.6, 2.8,
			3.5, 4, 2.5, 2.1, 1.7, 2, 1.8
		]
	}
];

export const REGIONS = INFLATION_BY_REGION.map(({ region }) => region);

export const REGION_VALUES: RegionRow[] = INFLATION_BY_REGION.flatMap(({ region, inflation }) =>
	MONTHS.map((date, monthIndex) => ({ date, region, value: inflation[monthIndex] }))
);
