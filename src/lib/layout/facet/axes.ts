import { isFacetWrap } from '$lib/layout/facet/config';
import type { FacetConfig, FacetEdges } from '$lib/types/layout/facet';
import type { AxisChannelName } from '$lib/types/layout/mapping';

/** How a facet cell draws its x/y axes: hidden, or with its title running vertically. */
export type FacetAxesDisplay = Partial<
	Record<AxisChannelName, { axisDisplay?: 'none'; labelOrientation?: 'vertical' }>
>;

/**
 * Each facet cell's axis display from `facet.axes`: with `'outer'`, an axis
 * every facet shares draws only on the grid's bottom (x) or left (y) edge,
 * and a drawn y axis' title runs vertically beside it. A free axis of a
 * wrapped facet has its own domain in each cell, so it always draws.
 */
export function buildFacetAxesDisplay<TRow extends Record<string, unknown>>(
	facet: FacetConfig<TRow>
): (place: { edges: FacetEdges }) => FacetAxesDisplay | undefined {
	if (facet.axes !== 'outer') return () => undefined;
	const mode = facet.scales ?? 'shared';
	const wrap = isFacetWrap(facet);
	const shared = (axis: AxisChannelName) => !(wrap && (mode === 'free' || mode === `free-${axis}`));
	return ({ edges }) => {
		const out: FacetAxesDisplay = {};
		for (const axis of ['x', 'y'] as const) {
			const hidden = shared(axis) && !(axis === 'x' ? edges.bottom : edges.left);
			if (hidden) out[axis] = { axisDisplay: 'none' };
			else if (axis === 'y') out[axis] = { labelOrientation: 'vertical' };
		}
		return Object.keys(out).length ? out : undefined;
	};
}
