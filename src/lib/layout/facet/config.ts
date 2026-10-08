import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { FacetConfig, FacetWrapConfig } from '$lib/types/layout/facet';
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
