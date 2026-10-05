/**
 * Every finite numeric value a set of markers draws on one axis, read from
 * each marker's own `data`. Markers without their own `data` reuse the plot's
 * rows, which the plot's domain already covers, so they're skipped. Lets a
 * plot's scale domain grow to fit derived marks (a density curve's peak, a
 * regression band) instead of clipping them.
 */
export function markerAxisValues(markers: object[], axis: 'x' | 'y'): number[] {
	return markers.flatMap((markerConfig) => {
		const marker = markerConfig as { data?: unknown; x?: unknown; y?: unknown };
		const accessor = marker[axis];
		const rows = marker.data as Record<string, unknown>[] | undefined;
		// svelteplot's own transforms key their output rows by symbols, so a symbol accessor is read like a field key.
		if (
			!rows ||
			!(
				typeof accessor === 'string' ||
				typeof accessor === 'symbol' ||
				typeof accessor === 'function'
			)
		)
			return [];
		return rows
			.map((row) =>
				typeof accessor === 'function'
					? accessor(row)
					: (row as Record<string | symbol, unknown>)[accessor]
			)
			.map(Number)
			.filter(Number.isFinite);
	});
}
