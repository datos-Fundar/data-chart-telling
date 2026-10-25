import { resolveAccessor } from '$lib/utils/accessors';
import type { FacetConfig, FacetWrapConfig } from '$lib/types/layout/facet';
import type { FacetPanel } from '$lib/types/phases/facet/phase';
import type { Accessor } from '$lib/types/plots/data/common';

/** Whether a facet config wraps one facet per `by` value, rather than laying out a `rows`/`cols` grid. */
export function isFacetWrap<TRow extends Record<string, unknown>>(
	facet: FacetConfig<TRow>
): facet is FacetWrapConfig<TRow> {
	return facet.by !== undefined;
}

/** One `rows` × `cols` grid cell's rows. */
export type FacetGridGroup<TRow> = { rows: TRow[]; row?: string; col?: string };

/** The key a `rows`/`cols` grid files a cell under. */
export function facetGridKey(row: string | undefined, col: string | undefined): string {
	return `${row ?? ''}\u0000${col ?? ''}`;
}

/** Rows split into `rows` × `cols` grid cells, keyed by {@link facetGridKey}; an unset accessor leaves its value `undefined`. */
export function buildFacetGridGroups<TRow extends Record<string, unknown>>(
	data: TRow[],
	rows: Accessor<TRow, unknown> | undefined,
	cols: Accessor<TRow, unknown> | undefined
): Map<string, FacetGridGroup<TRow>> {
	const getRow = rows === undefined ? null : resolveAccessor<TRow>(rows);
	const getCol = cols === undefined ? null : resolveAccessor<TRow>(cols);
	const out = new Map<string, FacetGridGroup<TRow>>();
	for (const d of data) {
		const row = getRow ? String(getRow(d)) : undefined;
		const col = getCol ? String(getCol(d)) : undefined;
		const key = facetGridKey(row, col);
		const group = out.get(key);
		if (group) group.rows.push(d);
		else out.set(key, { rows: [d], row, col });
	}
	return out;
}

/** A facet's key for one row: its `by` value, or its `rows`/`cols` values as a {@link facetGridKey}. */
export function buildFacetKeyOf<TRow extends Record<string, unknown>>(
	facet: FacetConfig<TRow>
): (row: TRow) => string {
	if (isFacetWrap(facet)) {
		const get = resolveAccessor<TRow>(facet.by);
		return (row) => String(get(row));
	}
	const getRow = facet.rows === undefined ? null : resolveAccessor<TRow>(facet.rows);
	const getCol = facet.cols === undefined ? null : resolveAccessor<TRow>(facet.cols);
	return (row) =>
		facetGridKey(
			getRow ? String(getRow(row)) : undefined,
			getCol ? String(getCol(row)) : undefined
		);
}

/**
 * Every panel a facet lays out over `data`, in layout order, with its rows:
 * one per `by` value (narrowed and ordered by `values`), or one per
 * non-empty `rows` x `cols` combination, row by row (narrowed and ordered by
 * `rowValues`/`colValues`).
 */
export function buildFacetPanels<TRow extends Record<string, unknown>>(
	facet: FacetConfig<TRow>,
	data: TRow[]
): (FacetPanel & { rows: TRow[] })[] {
	if (isFacetWrap(facet)) {
		const get = resolveAccessor<TRow>(facet.by);
		const groups = new Map<string, TRow[]>();
		for (const row of data) {
			const key = String(get(row));
			const bucket = groups.get(key);
			if (bucket) bucket.push(row);
			else groups.set(key, [row]);
		}
		const keys = facet.values ? facet.values.filter((v) => groups.has(v)) : [...groups.keys()];
		return keys.map((key) => ({ key, label: key, rows: groups.get(key)! }));
	}
	const groups = buildFacetGridGroups(data, facet.rows, facet.cols);
	const distinct = (pick: 'row' | 'col', given: string[] | undefined) =>
		given ?? [...new Set([...groups.values()].map((g) => g[pick]))];
	const rowKeys = distinct('row', facet.rowValues);
	const colKeys = distinct('col', facet.colValues);
	return rowKeys.flatMap((row) =>
		colKeys.flatMap((col) => {
			const key = facetGridKey(row, col);
			const group = groups.get(key);
			if (!group?.rows.length) return [];
			const label = row !== undefined && col !== undefined ? `${row} · ${col}` : (row ?? col ?? '');
			return [
				{
					key,
					label,
					rows: group.rows,
					...(row !== undefined ? { row } : {}),
					...(col !== undefined ? { col } : {})
				}
			];
		})
	);
}

/** The key of the panel a facet cell shows: its `by` value, or its `rows`/`cols` values as a {@link facetGridKey}. */
export function buildFacetPlaceKey<TRow extends Record<string, unknown>>(
	facet: FacetConfig<TRow>,
	place: { facetValue: string; row?: string; col?: string }
): string {
	return isFacetWrap(facet) ? place.facetValue : facetGridKey(place.row, place.col);
}
