import { resolveAccessor } from '$lib/utils/accessors';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { BandSlice } from '$lib/types/layout/hover';
import type { BandMarkerConfig } from '$lib/types/markers/common';

/** One band to draw: its category, the part of it filled, and the first row that names it. */
export type Band = { category: AxisValue; slice: BandSlice; row: unknown; index: number };

/** The bands a `band` marker draws, one per category its rows (or its `value`) name, in the order they first come. */
export class Bands {
	static readonly #WHOLE: BandSlice = { start: 0, end: 0 };

	/** The marker's bands. Rows that share a category share one band, which fills what all of their slices do. */
	static of(marker: Pick<BandMarkerConfig, 'value' | 'slice' | 'data'>): Band[] {
		const { rows, categoryOf } = Bands.#rowsOf(marker);
		const sliceOf = Bands.#sliceOf(marker.slice);
		const bands = new Map<unknown, Band>();
		rows.forEach((row, index) => {
			const category = categoryOf(row);
			if (category == null) return;
			const key = category instanceof Date ? +category : category;
			const slice = sliceOf(row);
			const band = bands.get(key);
			if (!band) {
				bands.set(key, { category, slice, row, index });
				return;
			}
			// What either one fills: the least left out at each end.
			band.slice = {
				start: Math.min(band.slice.start, slice.start),
				end: Math.min(band.slice.end, slice.end)
			};
		});
		return [...bands.values()];
	}

	/** The rows a marker draws from, and the category of each: its `data` and `value`, or its `value`'s own. */
	static #rowsOf(marker: Pick<BandMarkerConfig, 'value' | 'data'>): {
		rows: unknown[];
		categoryOf: (row: unknown) => AxisValue | undefined;
	} {
		const { value, data } = marker;
		if (data) {
			const read = resolveAccessor(value as never) as (row: unknown) => AxisValue | undefined;
			return { rows: data, categoryOf: read };
		}
		const values = (Array.isArray(value) ? value : [value]) as AxisValue[];
		return { rows: values, categoryOf: (row) => row as AxisValue };
	}

	/** Each row's slice: the marker's own, or a function of the row's; the whole band when it gives none. */
	static #sliceOf(slice: BandMarkerConfig['slice']): (row: unknown) => BandSlice {
		const whole = Bands.#WHOLE;
		const read = typeof slice === 'function' ? slice : () => slice;
		return (row) => {
			const own = read(row);
			return own ? { start: own.start ?? 0, end: own.end ?? 0 } : whole;
		};
	}
}
