// Small synthetic datasets shared by the documentation figures. Deterministic, so the
// screenshots in docs/images are reproducible.

/** A seeded pseudo-random generator, so "random" data is the same on every run. */
function lcg(seed: number): () => number {
	let s = seed;
	return () => {
		s = (s * 1664525 + 1013904223) % 4294967296;
		return s / 4294967296;
	};
}

// ── Monthly price index by division ─────────────────────────────────────────

export type PriceRow = { date: Date; division: string; index: number };

const DIVISIONS = [
	{ name: 'Food', growth: 0.019 },
	{ name: 'Transport', growth: 0.016 },
	{ name: 'Housing', growth: 0.021 },
	{ name: 'Health', growth: 0.013 }
];

export const PRICES: PriceRow[] = DIVISIONS.flatMap(({ name, growth }, d) =>
	Array.from({ length: 48 }, (_, m) => ({
		date: new Date(Date.UTC(2021 + Math.floor(m / 12), m % 12, 1)),
		division: name,
		index: Math.round(100 * Math.exp(growth * m) * (1 + 0.012 * Math.sin(m / 2 + d)) * 10) / 10
	}))
);

// ── Life expectancy by sex ──────────────────────────────────────────────────

export type LifeRow = { year: number; sex: string; value: number | null };

export const LIFE: LifeRow[] = ['female', 'male'].flatMap((sex, s) =>
	Array.from({ length: 15 }, (_, i) => ({
		year: 2008 + i,
		sex,
		value: Math.round((77.5 + (s === 0 ? 4.4 : 0) + i * 0.38 + Math.sin(i / 2) * 0.35) * 10) / 10
	}))
);

/** The female series with holes: the first year, one in the middle and the last. */
export const LIFE_GAPS: LifeRow[] = LIFE.map((r) =>
	r.sex === 'female' && [2008, 2013, 2022].includes(r.year) ? { ...r, value: null } : r
).filter((r) => r.sex === 'female');

// ── Life expectancy by province ─────────────────────────────────────────────

export type ProvinceRow = { province: string; sex: string; value: number };

export const PROVINCES = ['Buenos Aires', 'Cordoba', 'Mendoza', 'Salta', 'Chubut'];

export const PROVINCE_VALUES: ProvinceRow[] = PROVINCES.flatMap((province, p) =>
	['female', 'male'].map((sex, s) => ({
		province,
		sex,
		value: Math.round((81.2 - p * 0.9 - s * 5.1 + (p % 2) * 0.6) * 10) / 10
	}))
);

// ── Population pyramid ──────────────────────────────────────────────────────

export type AgeRow = { ageGroup: string; sex: string; share: number };

export const AGE_GROUPS = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70+'];

export const AGES: AgeRow[] = AGE_GROUPS.flatMap((ageGroup, a) =>
	['Female', 'Male'].map((sex, s) => ({
		ageGroup,
		sex,
		share:
			Math.round(
				(7.4 + 1.1 * Math.sin(a * 0.45) - a * 0.35 - s * 0.25 + (a > 5 ? s * -0.6 : 0)) * 10
			) / 10
	}))
);

// ── Countries (scatter) ─────────────────────────────────────────────────────

export type CountryRow = {
	country: string;
	gdp: number;
	life: number;
	population: number;
	continent: string;
	income: string;
};

const NEXT = lcg(7);
export const COUNTRIES: CountryRow[] = Array.from({ length: 28 }, (_, i) => {
	const gdp = Math.round(1500 + NEXT() * 52000);
	return {
		country: `Country ${i + 1}`,
		gdp,
		life: Math.round((58 + Math.log10(gdp / 1000) * 12 + NEXT() * 4) * 10) / 10,
		population: Math.round(2 + NEXT() * 140),
		continent: ['Africa', 'Americas', 'Asia', 'Europe'][i % 4],
		income: gdp > 30000 ? 'High' : gdp > 8000 ? 'Middle' : 'Low'
	};
});

// ── Heatmap cells ───────────────────────────────────────────────────────────

export type SalesRow = { quarter: string; product: string; sales: number };

export const SALES: SalesRow[] = ['Q1', 'Q2', 'Q3', 'Q4'].flatMap((quarter, q) =>
	['Alpha', 'Beta', 'Gamma', 'Delta'].map((product, p) => ({
		quarter,
		product,
		sales: Math.round(40 + 25 * Math.sin(q * 1.1 + p) + p * 9 + q * 6)
	}))
);

// ── Distribution (histogram) ────────────────────────────────────────────────

export type WeightRow = { weight: number; group: string };

const NEXT_WEIGHT = lcg(11);
const gaussian = () =>
	Math.sqrt(-2 * Math.log(NEXT_WEIGHT() + 1e-9)) * Math.cos(2 * Math.PI * NEXT_WEIGHT());

export const WEIGHTS: WeightRow[] = ['female', 'male'].flatMap((group, g) =>
	Array.from({ length: 220 }, () => ({
		group,
		weight: Math.round((g === 0 ? 63 : 78) + gaussian() * (g === 0 ? 8 : 9))
	}))
);

// ── Regional series (facets, timeline, composer) ────────────────────────────

export type RegionRow = { year: number; region: string; value: number };

export const REGIONS = ['North', 'Center', 'South'];

export const REGION_VALUES: RegionRow[] = REGIONS.flatMap((region, r) =>
	Array.from({ length: 8 }, (_, i) => ({
		year: 2016 + i,
		region,
		value: 100 + (r + 1) * 4 * i + (i % 3) * 2 + r * 6
	}))
);
