import { HoverPhase } from '$lib/phases/hover/HoverPhase';
import type { GeoPlotState, GeoPlotCtx, TaggedGeoFeature } from '$lib/types/plots/geo/state';

/** Whether a pointer event is over an `inset` marker's panel, which has its own hover. */
export function isOverInset(e: PointerEvent): boolean {
	return (e.target as Element | null)?.closest?.('.dct-geo-inset') != null;
}

/**
 * GeoPlot's "hover" phase: each feature, at its centroid, matched by the
 * feature under the cursor and read as its id. A feature outside the active
 * legend range stays drawn, dimmed, but is never a candidate.
 */
export function buildHover<TProps extends Record<string, unknown>>(
	state: GeoPlotState<TProps>,
	ctx: GeoPlotCtx<TProps>
): GeoPlotState<TProps> {
	const { color, tooltip, authoredMarkers } = state;
	const { range } = ctx;
	const features = state.features!;
	const label = (f: TaggedGeoFeature<TProps>) => f.__id;
	const points = features
		.filter((f) => !range || !color || HoverPhase.inRange(color(f), range))
		.map((f) => ({ x: f.__cx, y: f.__cy, row: f, label: label(f) }));
	const hover = {
		...HoverPhase.buildHoverConfig<TaggedGeoFeature<TProps>>({
			tooltip: tooltip as never,
			format: state.tooltipFormat as (row: TaggedGeoFeature<TProps>) => string,
			markers: authoredMarkers,
			points,
			label,
			defaultStrategy: 'punctual',
			// Match the feature under the cursor, not the nearest centroid.
			pointMatching: 'contains'
		}),
		// A map has no axis to draw a crosshair rule against - 'punctual' here
		// only means "exact XY hover match", unlike heatmap's own use of it.
		strategy: 'punctual' as const,
		crosshair: false,
		exclude: isOverInset
	};
	return {
		...state,
		hover,
		hoverPosition: {
			x: (f: TaggedGeoFeature<TProps>) => f.__cx,
			y: (f: TaggedGeoFeature<TProps>) => f.__cy
		},
		hoverRows: features
	};
}
