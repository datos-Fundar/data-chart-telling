// Flat categorical bars over a few years - used by the BarPlot stories.

export type RegionYear = { year: number; region: string; value: number };

export const REGION_BARS: RegionYear[] = [2018, 2020, 2022].flatMap((year) =>
	['North', 'Central', 'South', 'East', 'West'].map((region, i) => ({
		year,
		region,
		value: Math.round(30 + 10 * i + 6 * Math.sin(year - 2018 + i))
	}))
);

// Regions with two sectors each - for the `strategy: 'series'` facet-sync demo.
export type RegionSector = { region: string; sector: string; value: number };

export const REGION_SECTOR_BARS: RegionSector[] = ['North', 'Central', 'South', 'East'].flatMap(
	(region, i) =>
		['Industry', 'Services'].map((sector, j) => ({
			region,
			sector,
			value: Math.round(20 + 8 * i + 12 * j)
		}))
);
