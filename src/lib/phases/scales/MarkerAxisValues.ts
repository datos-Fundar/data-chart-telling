/**
 * Every finite numeric value a set of markers draws on one axis, read from
 * each marker's own `data`: its position channel and its range edges (`x1`/`x2`
 * for `x`), so a rect's or a band's full extent counts, not just its middle.
 * Markers without their own `data` reuse the plot's rows, which the plot's
 * domain already covers, so they're skipped. Lets a plot's scale domain grow to
 * fit derived marks (a density curve's peak, a regression band) instead of
 * clipping them.
 */
export class MarkerAxisValues {
	static of(markers: object[], axis: 'x' | 'y'): number[] {
		return markers.flatMap((markerConfig) => {
			const marker = markerConfig as Record<string, unknown>;
			const rows = marker.data as Record<string | symbol, unknown>[] | undefined;
			if (!rows) return [];
			return [axis, `${axis}1`, `${axis}2`].flatMap((channel) => {
				const accessor = marker[channel];
				// A literal edge (a bar anchored at `0`) counts as is.
				if (typeof accessor === 'number') return Number.isFinite(accessor) ? [accessor] : [];
				// svelteplot's own transforms key their output rows by symbols, so a symbol accessor is read like a field key.
				if (
					!(
						typeof accessor === 'string' ||
						typeof accessor === 'symbol' ||
						typeof accessor === 'function'
					)
				)
					return [];
				return rows
					.map((row) => (typeof accessor === 'function' ? accessor(row) : row[accessor]))
					.map(Number)
					.filter(Number.isFinite);
			});
		});
	}
}
