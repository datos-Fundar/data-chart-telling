// ── International commodity prices ──────────────────────────────────────────
// IMF, Primary Commodity Prices (PCPS), via DBnomics. Monthly, 2021-2024, as
// an index with January 2021 = 100 so every commodity shares one axis.

export type PriceRow = { date: Date; commodity: string; index: number };

const PRICE_INDEX_BY_COMMODITY = [
	{
		commodity: 'Brent oil',
		index: [
			100, 113, 119, 119, 124, 133, 135, 128, 135, 152, 146, 135, 155, 171, 204, 192, 203, 213, 191,
			177, 164, 170, 165, 148, 152, 151, 144, 151, 137, 136, 145, 154, 168, 161, 149, 140, 143, 148,
			154, 161, 150, 150, 152, 143, 132, 136, 133, 133
		]
	},
	{
		commodity: 'Natural gas',
		index: [
			100, 110, 99, 101, 112, 124, 144, 152, 192, 210, 193, 146, 160, 169, 188, 255, 308, 286, 268,
			331, 296, 230, 245, 217, 131, 92, 91, 83, 87, 94, 100, 100, 102, 120, 115, 96, 103, 68, 66,
			67, 91, 106, 84, 79, 91, 97, 113, 130
		]
	},
	{
		commodity: 'Coal',
		index: [
			100, 102, 105, 108, 115, 145, 168, 191, 207, 265, 195, 199, 255, 299, 388, 368, 460, 470, 477,
			492, 514, 469, 405, 470, 445, 268, 215, 221, 197, 152, 155, 168, 185, 166, 145, 164, 155, 141,
			151, 151, 163, 158, 156, 167, 163, 168, 165, 154
		]
	},
	{
		commodity: 'Wheat',
		index: [
			100, 101, 97, 101, 117, 100, 102, 116, 113, 124, 133, 136, 137, 146, 163, 171, 187, 167, 135,
			136, 146, 149, 145, 136, 135, 140, 130, 131, 126, 119, 117, 101, 96, 91, 91, 97, 95, 92, 89,
			88, 96, 86, 77, 74, 79, 83, 78, 78
		]
	}
];

export const PRICES: PriceRow[] = PRICE_INDEX_BY_COMMODITY.flatMap(({ commodity, index }) =>
	index.map((value, monthIndex) => ({
		date: new Date(Date.UTC(2021, monthIndex, 1)),
		commodity,
		index: value
	}))
);
