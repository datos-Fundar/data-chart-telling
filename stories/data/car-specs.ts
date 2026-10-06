// Illustrative car specs for the parallel-coordinates stories. Made up, not real
// models: each metric is on its own scale, which is the point of normalizing them.

export type CarSpec = { model: string; segment: string; metric: string; value: number };

const MODELS = [
	{ model: 'City S', segment: 'compact', power: 75, weight: 980, economy: 19, price: 14 },
	{ model: 'City X', segment: 'compact', power: 90, weight: 1040, economy: 17, price: 16 },
	{ model: 'Family L', segment: 'sedan', power: 130, weight: 1350, economy: 14, price: 24 },
	{ model: 'Family GT', segment: 'sedan', power: 165, weight: 1420, economy: 12, price: 29 },
	{ model: 'Trail 4', segment: 'pickup', power: 180, weight: 2050, economy: 9, price: 38 },
	{ model: 'Trail 6', segment: 'pickup', power: 220, weight: 2200, economy: 8, price: 45 }
];

/** The metrics in the order the rows list them, for an axis that should keep it. */
export const METRIC_ORDER = ['power', 'weight', 'economy', 'price'] as const;

/** One row per model and metric: power (hp), weight (kg), economy (km/l), price (thousand USD). */
export const CAR_SPECS: CarSpec[] = MODELS.flatMap((m) =>
	METRIC_ORDER.map((metric) => ({ model: m.model, segment: m.segment, metric, value: m[metric] }))
);
