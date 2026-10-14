import { isFacetWrap } from '$lib/layout/facet/config';
import type { FacetConfig } from '$lib/types/layout/facet';
import type { TimelineConfig } from '$lib/types/layout/timeline';

type Row = Record<string, unknown>;
type Field = string | ((row: Row) => unknown);
type Dimension = 'time' | 'by' | 'rows' | 'cols';

const SLICE = Symbol('dct-geo-slice');

/** A slicing field's value on a feature (from its `properties`) or on a marker's own row. */
function readField(field: Field, row: Row): unknown {
	if (typeof field === 'function') return field(row);
	if (row.type === 'Feature' && typeof row.properties === 'object' && row.properties !== null) {
		return (row.properties as Row)[field];
	}
	return row[field];
}

/**
 * What a GeoPlot hands `Plot` to slice by: one stand-in row per value
 * combination found in the features and markers' rows, and timeline/facet
 * accessors that read a stand-in or a real row.
 */
export function buildGeoSlicing(args: {
	rows: Row[];
	timeline?: TimelineConfig<Row>;
	facet?: FacetConfig<Row>;
}): { rows: Row[]; timeline?: TimelineConfig<Row>; facet?: FacetConfig<Row> } {
	const { rows, timeline, facet } = args;
	const fields: Partial<Record<Dimension, Field>> = {};
	if (timeline) fields.time = timeline.accessor as Field;
	if (facet && isFacetWrap(facet)) fields.by = facet.by as Field;
	if (facet && !isFacetWrap(facet)) {
		if (facet.rows !== undefined) fields.rows = facet.rows as Field;
		if (facet.cols !== undefined) fields.cols = facet.cols as Field;
	}
	const reader = (dimension: Dimension) => (row: Row) =>
		SLICE in row
			? (row[SLICE as unknown as string] as Record<Dimension, unknown>)[dimension]
			: readField(fields[dimension]!, row);

	let combos: Partial<Record<Dimension, unknown>>[] = [{}];
	for (const dimension of Object.keys(fields) as Dimension[]) {
		const values = [
			...new Set(rows.map((row) => readField(fields[dimension]!, row)).filter((v) => v != null))
		];
		combos = combos.flatMap((combo) => values.map((value) => ({ ...combo, [dimension]: value })));
	}

	return {
		rows: combos.map((combo) => ({ [SLICE]: combo }) as unknown as Row),
		timeline: timeline && {
			...timeline,
			accessor: reader('time') as never,
			interpolate: undefined
		},
		facet:
			facet &&
			(isFacetWrap(facet)
				? { ...facet, by: reader('by') }
				: {
						...facet,
						rows: facet.rows === undefined ? undefined : reader('rows'),
						cols: facet.cols === undefined ? undefined : reader('cols')
					})
	};
}
