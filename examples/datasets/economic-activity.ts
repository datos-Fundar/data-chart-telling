// ── The weight of each branch of activity in a city's gross added value ──────
// IDECBA, value added at basic prices by branch of activity, Ciudad de Buenos Aires,
// 2024 (preliminary), in millions of pesos of 2004. A selection of the larger branches.

export type ActivityRow = {
	sector: 'Primary' | 'Secondary' | 'Tertiary';
	kind: string;
	branch: string;
	/** Millions of pesos of 2004. */
	value: number;
};

export const ACTIVITY_BRANCHES: ActivityRow[] = [
	{ sector: 'Primary', kind: 'Extraction', branch: 'Oil, gas and coal', value: 778 },
	{ sector: 'Primary', kind: 'Agriculture', branch: 'Agriculture and livestock', value: 193 },
	{ sector: 'Secondary', kind: 'Manufacturing', branch: 'Chemicals', value: 2999 },
	{ sector: 'Secondary', kind: 'Manufacturing', branch: 'Food and beverages', value: 2882 },
	{ sector: 'Secondary', kind: 'Manufacturing', branch: 'Publishing and printing', value: 1251 },
	{ sector: 'Secondary', kind: 'Manufacturing', branch: 'Machinery and equipment', value: 973 },
	{ sector: 'Secondary', kind: 'Manufacturing', branch: 'Clothing', value: 814 },
	{ sector: 'Secondary', kind: 'Manufacturing', branch: 'Textiles', value: 381 },
	{
		sector: 'Tertiary',
		kind: 'Trade and transport',
		branch: 'Wholesale and retail trade',
		value: 15365
	},
	{ sector: 'Tertiary', kind: 'Trade and transport', branch: 'Transport', value: 3707 },
	{ sector: 'Tertiary', kind: 'Trade and transport', branch: 'Communications', value: 8210 },
	{ sector: 'Tertiary', kind: 'Finance', branch: 'Banking and finance', value: 7857 },
	{ sector: 'Tertiary', kind: 'Finance', branch: 'Insurance', value: 3106 },
	{ sector: 'Tertiary', kind: 'Public services', branch: 'Public administration', value: 7606 },
	{ sector: 'Tertiary', kind: 'Public services', branch: 'Public education', value: 2374 },
	{ sector: 'Tertiary', kind: 'Public services', branch: 'Public health', value: 1525 },
	{ sector: 'Tertiary', kind: 'Private services', branch: 'Private health', value: 5439 },
	{ sector: 'Tertiary', kind: 'Private services', branch: 'Private education', value: 1952 },
	{ sector: 'Tertiary', kind: 'Private services', branch: 'Restaurants and bars', value: 2439 },
	{ sector: 'Tertiary', kind: 'Real estate', branch: 'Housing', value: 6179 },
	{ sector: 'Tertiary', kind: 'Real estate', branch: 'Construction', value: 3905 }
];
