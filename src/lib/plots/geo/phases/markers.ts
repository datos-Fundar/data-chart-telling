import { HoverPhase } from '$lib/phases/hover/HoverPhase';
import { resolveFeatureStyle } from '$lib/plots/utils/geoSegments';
import { DisabledStyle } from '$lib/layout/legend/DisabledStyle';
import type { MarkerConfig } from '$lib/types/markers/all';
import type {
	GeoMarkersConfig,
	GeoHoverMarkerConfig,
	GeoFeaturesMarkerConfig,
	GeoGraticuleMarkerConfig,
	GeoSphereMarkerConfig,
	GeoContourMarkerConfig
} from '$lib/types/markers/geo';
import type { GeoSegmentStyle } from '$lib/types/plots/segments/common';
import type {
	GeoPlotState,
	GeoPlotCtx,
	GeoStyleGroup,
	TaggedGeoFeature
} from '$lib/types/plots/geo/state';

/**
 * `graticule`/`sphere`/`contour` opt into drawing underneath the base map's
 * own fill/stroke instead of on top of it - see each config's own `behind`
 * doc comment.
 */
function isBehindMarker(
	marker: GeoMarkersConfig
): marker is GeoGraticuleMarkerConfig | GeoSphereMarkerConfig | GeoContourMarkerConfig {
	return (
		(marker.type === 'graticule' || marker.type === 'sphere' || marker.type === 'contour') &&
		marker.behind === true
	);
}

/**
 * GeoPlot's "markers" phase: per-feature style resolution/grouping, the base
 * `'geo'` marker(s), and the full draw order - any authored marker with
 * `behind: true`, then the base map, then the rest of the authored markers,
 * with any `hover` marker moved last. The base marker(s) match the pointer
 * themselves, over the features inside the legend's range.
 */
export function buildMarkers<TProps extends Record<string, unknown>>(
	state: GeoPlotState<TProps>,
	ctx: GeoPlotCtx<TProps>
): GeoPlotState<TProps> {
	const { features, segments, authoredMarkers, color, grouping, resolveColor, resolveOpacity } =
		state;
	const { range, fill, fillOpacity, stroke, strokeWidth, cfg, onFeatureClick } = ctx;
	const OPACITY_STEPS = 32;

	function rangeFilteredStyle(base: GeoSegmentStyle, f: TaggedGeoFeature<TProps>): GeoSegmentStyle {
		if (range == null || !color) return base;
		const v = color(f);
		if (v == null || (v >= range.min && v <= range.max)) return base;
		return { ...base, ...DisabledStyle.fill(range.disabledStyle) };
	}

	function getFeatureStyle(f: TaggedGeoFeature<TProps>): GeoSegmentStyle {
		return rangeFilteredStyle(
			resolveFeatureStyle<GeoSegmentStyle>(segments, f.__id, grouping?.(f)),
			f
		);
	}

	const groups = new Map<string, GeoStyleGroup<TProps>>();
	for (const f of features!) {
		const style = getFeatureStyle(f);
		const rawOpacity = resolveOpacity?.(f);
		const opacity =
			rawOpacity != null ? Math.round(rawOpacity * OPACITY_STEPS) / OPACITY_STEPS : undefined;
		const key = JSON.stringify({ style, opacity });
		let group = groups.get(key);
		if (!group) {
			group = { style, opacity, data: [] };
			groups.set(key, group);
		}
		group.data.push(f);
	}
	const styleGroups = [...groups.values()];

	function resolveBaseFill(f: TaggedGeoFeature<TProps>): string {
		return resolveColor?.(f) ?? fill ?? cfg.palette[0];
	}

	// What the pointer can match: the features inside the legend's range, by id.
	const hoverable = new Map(
		features!
			.filter((f) => !range || !color || HoverPhase.inRange(color(f), range))
			.map((f) => [f.__id, f as unknown as Record<string, unknown>])
	);
	const featureMarkers: GeoFeaturesMarkerConfig[] = styleGroups.map((group) => ({
		type: 'geo',
		data: group.data,
		fill: (d) => group.style.fill ?? resolveBaseFill(d as TaggedGeoFeature<TProps>),
		fillOpacity: group.style.fillOpacity ?? group.opacity ?? fillOpacity ?? 1,
		stroke: group.style.stroke ?? stroke ?? cfg.axis.color,
		strokeWidth: group.style.strokeWidth ?? strokeWidth ?? 0.5,
		hover: hoverable,
		onclick: onFeatureClick ? (e, d) => onFeatureClick(d as TaggedGeoFeature<TProps>, e) : undefined
	}));

	const behindMarkers = authoredMarkers.filter(isBehindMarker);
	const frontMarkers = authoredMarkers.filter((m) => !isBehindMarker(m) && m.type !== 'geo-hover');
	const hoverMarker = authoredMarkers.find(
		(m): m is GeoHoverMarkerConfig => m.type === 'geo-hover'
	);

	const markers: MarkerConfig[] = [
		...behindMarkers,
		...featureMarkers,
		...frontMarkers,
		...(hoverMarker ? [hoverMarker] : [])
	];

	return { ...state, markers, styleGroups };
}
