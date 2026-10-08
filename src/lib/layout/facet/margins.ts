import type { MarginConfig } from '$lib/types/plots/props';

const MARGIN_SIDES = ['left', 'right', 'top', 'bottom'] as const;

/** One margin for every facet: each side the largest numeric need any facet reports. */
export function buildSharedMargins<TRow>(
	facets: TRow[][],
	marginsForFacet: (rows: TRow[]) => MarginConfig
): MarginConfig {
	const perFacet = facets.map((rows) => marginsForFacet(rows));
	const out: MarginConfig = {};
	for (const side of MARGIN_SIDES) {
		let max: number | undefined;
		for (const margin of perFacet) {
			const value = margin[side];
			if (typeof value !== 'number') continue;
			max = max === undefined ? value : Math.max(max, value);
		}
		if (max !== undefined) out[side] = max;
	}
	return out;
}

/** Edges of the `index`-th of `count` cells flowed row by row into `columns`. */
export function wrapEdges(index: number, count: number, columns: number) {
	return {
		top: index < columns,
		left: index % columns === 0,
		right: index % columns === columns - 1 || index === count - 1,
		bottom: index + columns >= count
	};
}
