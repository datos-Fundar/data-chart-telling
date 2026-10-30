import type { FacetScoped, FacetTarget, FacetValue } from '$lib/types/layout/facet';
import type { SlicePlace } from '$lib/types/layout/plot';
import type { FacetPanel } from '$lib/types/phases';
import { FacetPanels, PANEL_KEY } from '$lib/phases/facet/FacetPanels';

/** Where a facet panel sits, as a segment's or a marker's `facet` names it. */
type PanelPlace = SlicePlace['facet'];

/**
 * Limiting a plot's segments and markers to some facet panels: which panels a `facet` names, and each
 * panel's share of a list of them. A plot with no facet has no panel, so what names one is left out.
 */
export class FacetScope {
	/** Where a panel the "facet" phase laid out sits. */
	static placeOf(panel: FacetPanel): NonNullable<PanelPlace> {
		return {
			facetValue: panel.label,
			...(panel.row !== undefined ? { row: panel.row } : {}),
			...(panel.col !== undefined ? { col: panel.col } : {})
		};
	}

	/**
	 * Whether something limited to `target` applies at the facet panel `place`. Without a target it
	 * applies everywhere; with one, only to the panels it names, and to no plot that has no facet.
	 */
	static targets(target: FacetTarget | undefined, place: PanelPlace): boolean {
		if (target === undefined) return true;
		if (!place) return false;
		const names = (value: FacetValue | FacetValue[]) =>
			(Array.isArray(value) ? value : [value]).map(String);
		if (typeof target === 'object' && !Array.isArray(target)) {
			const matches = (wanted: FacetValue | FacetValue[] | undefined, actual: string | undefined) =>
				wanted === undefined || (actual !== undefined && names(wanted).includes(actual));
			return matches(target.row, place.row) && matches(target.col, place.col);
		}
		return names(target).includes(place.facetValue);
	}

	/**
	 * `items` as the facet panel `place` sees them: those that name no facet, or name this one, with
	 * their `facet` taken off. The same list comes back when none names a facet.
	 */
	static scope<T extends object>(items: T[] | undefined, place: PanelPlace): T[] | undefined {
		const facetOf = (item: T) => (item as FacetScoped).facet;
		if (!items || items.every((item) => facetOf(item) === undefined)) return items;
		return items
			.filter((item) => FacetScope.targets(facetOf(item), place))
			.map((item) => {
				const rest = { ...item } as T & FacetScoped;
				delete rest.facet;
				return rest;
			});
	}

	/** A `segments` config as the facet panel `place` sees it: each series' segments, {@link FacetScope.scope}d. */
	static scopeSegments<T extends object>(
		segments: Record<string, T[]> | undefined,
		place: PanelPlace
	): Record<string, T[]> | undefined {
		if (!segments) return segments;
		const scoped = Object.entries(segments).map(
			([series, list]) => [series, FacetScope.scope(list, place) ?? list] as const
		);
		if (scoped.every(([series, list]) => list === segments[series])) return segments;
		return Object.fromEntries(scoped);
	}

	/**
	 * `segments` for a plot whose series are split by facet panel: each segment that names a facet moves
	 * under the key of its series in every panel it names - the id of that series' part there, as
	 * {@link FacetPanels.buildSeriesId} writes it, or `default` for the panel's series without their own -
	 * and loses its `facet`. Segments that name none stay where they were. The same config comes back
	 * when none names a facet.
	 */
	static distributeSegments<T extends object>(
		segments: Record<string, T[]> | undefined,
		panels: FacetPanel[]
	): Record<string, T[]> | undefined {
		if (!segments) return segments;
		const named = Object.values(segments).some((list) =>
			list.some((item) => (item as FacetScoped).facet !== undefined)
		);
		if (!named) return segments;
		const distributed: Record<string, T[]> = {};
		for (const [series, list] of Object.entries(segments)) {
			for (const item of list) {
				const { facet, ...rest } = item as T & FacetScoped;
				if (facet === undefined) {
					(distributed[series] ??= []).push(item);
					continue;
				}
				for (const panel of panels) {
					if (!FacetScope.targets(facet, FacetScope.placeOf(panel))) continue;
					(distributed[FacetPanels.buildSeriesId(panel.key, series)] ??= []).push(
						rest as unknown as T
					);
				}
			}
		}
		return distributed;
	}

	/**
	 * `markers` for a plot split by facet panel: each marker that names a facet becomes one copy per
	 * panel it names, tagged with that panel ({@link PANEL_KEY}) and without its `facet`, in the marker's
	 * own place in the list. Markers that name none stay as they are, for every panel.
	 */
	static distributeMarkers<T extends object>(
		markers: T[] | undefined,
		panels: FacetPanel[]
	): T[] | undefined {
		if (!markers || markers.every((marker) => (marker as FacetScoped).facet === undefined)) {
			return markers;
		}
		return markers.flatMap((marker) => {
			const { facet, ...rest } = marker as T & FacetScoped;
			if (facet === undefined) return [marker];
			return panels
				.filter((panel) => FacetScope.targets(facet, FacetScope.placeOf(panel)))
				.map((panel) => ({ ...rest, [PANEL_KEY]: panel.key }) as unknown as T);
		});
	}
}
