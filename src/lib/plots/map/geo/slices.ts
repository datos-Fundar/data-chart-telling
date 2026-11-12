import { TimelineTime } from '$lib/layout/timeline/TimelineTime';
import { isFacetWrap } from '$lib/layout/facet/config';
import type { FacetConfig } from '$lib/types/layout/facet';
import type { TimelineConfig, TimeValue } from '$lib/types/layout/timeline';
import type { SlicePlace } from '$lib/types/layout/plot';
import type { GeoSliceContext } from '$lib/types/plots/data/geo';

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

/** One slice of a sliced map: where it sits, and the context its features are read in. */
export type GeoSlice = { place: SlicePlace; context: GeoSliceContext };

/**
 * What a GeoPlot hands `Plot` to slice by: one stand-in row per value
 * combination, and timeline/facet accessors that read a stand-in or a real
 * row. A dimension's values are the ones the timeline or facet names
 * (`timeline.values`, `facet.values`, `rowValues`, `colValues`), in
 * their order, then any more found in the features and markers' rows - so
 * the slices exist even when no feature carries the field. Each combination
 * is also returned as a `slices` entry: its place and the context its
 * features are read in.
 */
export function buildGeoSlicing(args: {
	rows: Row[];
	timeline?: TimelineConfig<Row>;
	facet?: FacetConfig<Row>;
}): {
	rows: Row[];
	slices: GeoSlice[];
	timeline?: TimelineConfig<Row>;
	facet?: FacetConfig<Row>;
} {
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

	/** The values the timeline or facet names for a dimension, ahead of the ones found. */
	const named: Partial<Record<Dimension, unknown[]>> = {
		time: timeline?.values,
		by: facet && isFacetWrap(facet) ? facet.values : undefined,
		rows: facet && !isFacetWrap(facet) ? facet.rowValues : undefined,
		cols: facet && !isFacetWrap(facet) ? facet.colValues : undefined
	};

	const time = new TimelineTime(timeline?.dateFormat);
	let combos: Partial<Record<Dimension, unknown>>[] = [{}];
	for (const dimension of Object.keys(fields) as Dimension[]) {
		const read = rows.map((row) => readField(fields[dimension]!, row)).filter((v) => v != null);
		// Dates on the same step are one value.
		const keyOf = (value: unknown) =>
			dimension === 'time' ? String(time.toTime(value) ?? value) : String(value);
		const values = [
			...new Map(
				[...(named[dimension] ?? []), ...read].map((value) => [keyOf(value), value])
			).values()
		];
		combos = combos.flatMap((combo) => values.map((value) => ({ ...combo, [dimension]: value })));
	}

	const slices = combos.map((combo): GeoSlice => {
		const tick = combo.time === undefined ? undefined : time.toTime(combo.time);
		const by = combo.by === undefined ? undefined : String(combo.by);
		const row = combo.rows === undefined ? undefined : String(combo.rows);
		const col = combo.cols === undefined ? undefined : String(combo.cols);
		const value = by ?? (row !== undefined && col !== undefined ? `${row} · ${col}` : (row ?? col));
		const place: SlicePlace = {
			...(tick === undefined ? {} : { time: tick as TimeValue }),
			...(value === undefined
				? {}
				: {
						facet: {
							facetValue: value,
							...(row === undefined ? {} : { row }),
							...(col === undefined ? {} : { col })
						}
					})
		};
		return { place, context: GeoSlices.contextOf(place) };
	});

	return {
		rows: combos.map((combo) => ({ [SLICE]: combo }) as unknown as Row),
		slices,
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

export const GeoSlices = {
	/** The context a callback reads a feature in, for the slice at `place`: empty when there is none. */
	contextOf(place: {
		time?: TimeValue;
		facet?: { facetValue: string; row?: string; col?: string };
	}): GeoSliceContext {
		const { time, facet } = place;
		return {
			...(facet
				? {
						facet: {
							value: facet.facetValue,
							...(facet.row === undefined ? {} : { row: facet.row }),
							...(facet.col === undefined ? {} : { col: facet.col })
						}
					}
				: {}),
			...(time === undefined ? {} : { time })
		};
	}
};
