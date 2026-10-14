// Flat rows for the facet-layout stories: `groupCount` groups ("Group A", ...) of four
// categories each, with a deterministic value per cell.

export type FacetGroupRow = { group: string; category: string; value: number };

const CATEGORIES = ['A', 'B', 'C', 'D'];

export function facetGroups(groupCount: number): FacetGroupRow[] {
	return Array.from({ length: groupCount }, (_, gi) => String.fromCharCode(65 + gi)).flatMap(
		(group, gi) =>
			CATEGORIES.map((category, ci) => ({
				group: `Group ${group}`,
				category,
				value: Math.round(45 + 15 * Math.sin(gi * 1.3 + ci))
			}))
	);
}

// Provinces with long and short names, and magnitudes that differ wildly per
// facet - for the margin-alignment stories.
export type ProvinceBarRow = { province: string; category: string; value: number };
export type ProvinceLineRow = { province: string; year: number; value: number };

export const PROVINCES = [
	'Salta',
	'Buenos Aires',
	'Ciudad Autónoma de Buenos Aires',
	'San Luis',
	'Entre Ríos',
	'La Rioja'
];

const MAGNITUDES = [5, 500, 5_000, 50_000, 500_000, 5_000_000];
export const PROVINCE_BARS: ProvinceBarRow[] = PROVINCES.flatMap((province, i) =>
	['A', 'B', 'C'].map((category, ci) => ({
		province,
		category,
		value: Math.round(MAGNITUDES[i] * (0.6 + 0.2 * ci))
	}))
);

export const PROVINCE_LINES: ProvinceLineRow[] = PROVINCES.flatMap((province, i) => [
	{ province, year: 2016, value: MAGNITUDES[i] * 0.6 },
	{ province, year: 2020, value: MAGNITUDES[i] }
]);
