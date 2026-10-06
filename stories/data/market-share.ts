// Illustrative sales by region and channel for the mosaic stories. Made up, not
// real figures: regions differ in size, and each one splits its sales differently.

export type RegionChannelSales = { region: string; channel: string; sales: number };

const SPLITS: Record<string, [number, number, number]> = {
	Pampas: [55, 30, 15],
	Cuyo: [35, 40, 25],
	Patagonia: [20, 30, 50],
	Northwest: [45, 20, 35]
};

const TOTALS: Record<string, number> = { Pampas: 520, Cuyo: 180, Patagonia: 120, Northwest: 240 };

/** One row per region and sales channel; the region's total sets its column's width. */
export const REGION_CHANNEL_SALES: RegionChannelSales[] = Object.entries(SPLITS).flatMap(
	([region, split]) =>
		['Stores', 'Online', 'Wholesale'].map((channel, i) => ({
			region,
			channel,
			sales: Math.round((TOTALS[region] * split[i]) / 100)
		}))
);
