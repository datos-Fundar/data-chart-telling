export type Row = { year: number; region: string; value: number };

const REGIONS = ['North', 'Center', 'South'];

/** Tiny deterministic dataset shared by the examples: one value per region and year. */
export const ROWS: Row[] = REGIONS.flatMap((region, r) =>
	Array.from({ length: 8 }, (_, i) => ({
		year: 2016 + i,
		region,
		value: 100 + (r + 1) * 4 * i + (i % 3) * 2
	}))
);
