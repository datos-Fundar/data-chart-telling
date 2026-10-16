// Illustrative survey answers for the jitter and group stories. Generated in code
// with a fixed seed, not real responses: every answer is a whole number, so many
// respondents land on exactly the same point.

export type SurveyAnswer = { product: string; rating: number; recommend: number; age: number };

/** A small seeded PRNG, so every run draws the same answers. */
function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const random = mulberry32(11);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Each product's typical rating: the app is liked, the kiosk less so. */
const PRODUCTS = [
	{ product: 'App', bias: 4 },
	{ product: 'Website', bias: 3.3 },
	{ product: 'Kiosk', bias: 2.5 }
];

/** 80 answers per product: a 1-5 rating, and a 0-10 "would recommend" that follows it loosely. */
export const SURVEY_ANSWERS: SurveyAnswer[] = PRODUCTS.flatMap(({ product, bias }) =>
	Array.from({ length: 80 }, () => {
		const rating = clamp(Math.round(bias + (random() - 0.5) * 3), 1, 5);
		return {
			product,
			rating,
			recommend: clamp(Math.round(rating * 2 + (random() - 0.5) * 4), 0, 10),
			age: Math.round(18 + random() * 50)
		};
	})
);
