import { resolveAccessor } from '$lib/plots/utils/accessors';
import { isFacetWrap } from '$lib/layout/facet/config';
import type { FacetConfig } from '$lib/types/layout/facet';
import type { TimelineConfig, TimeValue } from '$lib/types/layout/timeline';

/** Where one cell sits among the slices: the timeline step and the facet it shows. */
export type SlicePlace = {
	time?: TimeValue;
	facet?: { facetValue: string; row?: string; col?: string };
};

/** Whether a row belongs in one slice. A row lacking a slicing field belongs in every slice. */
export function buildSliceFilter<TRow extends Record<string, unknown>>(args: {
	timeline?: TimelineConfig<TRow>;
	filterMode?: 'exact' | 'upTo';
	facet?: FacetConfig<TRow>;
	place: SlicePlace;
}): (row: TRow) => boolean {
	const { timeline, filterMode = 'exact', facet, place } = args;
	const tests: ((row: TRow) => boolean)[] = [];
	const matches = (accessor: unknown, expected: string | undefined) => {
		if (accessor === undefined || expected === undefined) return;
		const get = resolveAccessor<TRow>(accessor as never);
		tests.push((row) => {
			const value = get(row);
			return value == null || String(value) === expected;
		});
	};
	if (timeline && place.time !== undefined) {
		const get = resolveAccessor<TRow>(timeline.accessor);
		const time = place.time;
		tests.push((row) => {
			const value = get(row);
			if (value == null) return true;
			return filterMode === 'upTo' ? Number(value) <= time : Number(value) === time;
		});
	}
	if (facet && place.facet) {
		if (isFacetWrap(facet)) matches(facet.by, place.facet.facetValue);
		else {
			matches(facet.rows, place.facet.row);
			matches(facet.cols, place.facet.col);
		}
	}
	return (row) => tests.every((test) => test(row));
}
