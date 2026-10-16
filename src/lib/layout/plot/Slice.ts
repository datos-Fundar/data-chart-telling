import { resolveAccessor } from '$lib/plots/utils/accessors';
import { merge } from '$lib/utils/merge';
import { TimelineSteps } from '$lib/layout/timeline/TimelineSteps';
import { buildFacetAxesDisplay } from '$lib/layout/facet/axes';
import { buildFacetPlaceKey, isFacetWrap } from '$lib/layout/facet/config';
import type { FacetCellContext, FacetConfig } from '$lib/types/layout/facet';
import type { TimelineConfig } from '$lib/types/layout/timeline';
import type { SlicePlace } from '$lib/types/layout/plot';

/** What a plot is sliced by. */
export type SliceInputs<TRow extends Record<string, unknown>> = {
	/** The rows being sliced. Without them (a plot of pre-built `series`) nothing slices. */
	rows: TRow[] | undefined;
	timeline: TimelineConfig<TRow> | undefined;
	facet: FacetConfig<TRow> | undefined;
	/** The plot kind's default for `timeline.filterMode`. */
	filterMode: 'exact' | 'upTo' | undefined;
};

/**
 * How a plot's rows divide into slices - the timeline steps and facet panels
 * each cell of its grid shows: which rows belong in a slice ({@link Slice.keep}),
 * the scales the slices share and how the facets lay out. Create it once per
 * plot, from its current inputs.
 */
export class Slice<TRow extends Record<string, unknown>> {
	readonly timeline: TimelineConfig<TRow> | undefined;
	readonly facet: FacetConfig<TRow> | undefined;
	/** Whether the plot's rows are sliced at all. Unsliced, its one core is the whole plot. */
	readonly sliced: boolean;
	/** How a timeline matches rows to a step: the author's, else the plot kind's. */
	readonly filterMode: 'exact' | 'upTo' | undefined;
	/** The facet's layout alone - its `scales` and `axes` shape each cell instead. */
	readonly layout: Omit<FacetConfig<TRow>, 'scales' | 'axes'> | undefined;
	/** What is wrong with the slicing as set, for the author to fix. */
	readonly problems: string[] = [];
	readonly #axes: ReturnType<typeof buildFacetAxesDisplay<TRow>> | undefined;

	constructor({ rows, timeline, facet, filterMode }: SliceInputs<TRow>) {
		this.timeline = timeline;
		this.facet = facet;
		this.sliced = rows != null && (timeline != null || facet != null);
		this.filterMode = timeline?.filterMode ?? filterMode;
		this.#axes = facet ? buildFacetAxesDisplay(facet) : undefined;
		if (facet) {
			const layout = { ...facet };
			delete layout.scales;
			delete layout.axes;
			this.layout = layout;
		}
		if (!rows && (timeline || facet)) {
			this.problems.push(
				'`timeline` and `facet` slice flat `data` rows - they are ignored with pre-built `series`.'
			);
		}
		if (facet && facet.by === undefined && facet.rows === undefined && facet.cols === undefined) {
			this.problems.push('`facet` needs `by`, or `rows` and/or `cols`.');
		}
	}

	/** Whether a row belongs in the slice at `place`. A row lacking a slicing field belongs in every slice. */
	keep(place: SlicePlace): (row: TRow) => boolean {
		const { timeline, facet } = this;
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
				return TimelineSteps.matches(value, time, this.filterMode);
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

	/** The key of the facet panel the cell at `place` shows, or `undefined` without a facet. */
	panelKey(place: FacetCellContext<TRow>): string | undefined {
		return this.facet ? buildFacetPlaceKey(this.facet, place) : undefined;
	}

	/**
	 * The scales for the facet cell at `place`: its panel's share of the
	 * domains the slices `shared` (keyed by panel), under how `facet.axes`
	 * displays its axes.
	 */
	facetScales<TScales extends object>(
		shared: Record<string, object> | undefined,
		place: FacetCellContext<TRow>
	): TScales | undefined {
		const key = this.panelKey(place);
		if (key === undefined) return undefined;
		return merge(shared?.[key] as TScales | undefined, this.#axes?.(place) as TScales | undefined);
	}

	/** The scales a timeline alone keeps every step on - the domains all its rows span - unless it fits each step's own. */
	timelineScales<TScales extends object>(
		shared: Record<string, object> | undefined
	): TScales | undefined {
		const { timeline, facet } = this;
		if (!timeline || facet || timeline.scales === 'free') return undefined;
		return shared?.[''] as TScales | undefined;
	}
}
