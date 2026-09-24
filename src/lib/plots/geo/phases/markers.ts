import { resolveFeatureStyle } from '$lib/plots/utils/geoSegments';
import { disabledFillOverride } from '$lib/plots/utils/legendDisabled';
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
 * own fill/stroke instead of on top of it — see each config's own `behind`
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
 * `'geo'` marker(s), and the full draw order — any authored marker with
 * `behind: true`, then the base map, then the rest of the authored markers,
 * with any `hover` marker moved last. No hover pointer handlers yet on the
 * base marker(s) — those need `BasePlotLayout`'s live callbacks, so they're
 * attached separately by `attachFeatureHover`, outside the pipeline.
 */
export function buildMarkers<TProps extends Record<string, unknown>>(
	state: GeoPlotState<TProps>,
	ctx: GeoPlotCtx<TProps>
): GeoPlotState<TProps> {
	const { features, segments, authoredMarkers, value, colorScale } = state;
	const { range, fill, fillOpacity, stroke, strokeWidth, cfg, onFeatureClick } = ctx;

	function rangeFilteredStyle(base: GeoSegmentStyle, f: TaggedGeoFeature<TProps>): GeoSegmentStyle {
		if (range == null || !value) return base;
		const v = value(f);
		if (v == null || (v >= range.min && v <= range.max)) return base;
		return { ...base, ...disabledFillOverride(range.disabledStyle) };
	}

	function getFeatureStyle(f: TaggedGeoFeature<TProps>): GeoSegmentStyle {
		return rangeFilteredStyle(resolveFeatureStyle<GeoSegmentStyle>(segments, f.__id), f);
	}

	const groups = new Map<string, GeoStyleGroup<TProps>>();
	for (const f of features!) {
		const style = getFeatureStyle(f);
		const key = JSON.stringify(style);
		let group = groups.get(key);
		if (!group) {
			group = { style, data: [] };
			groups.set(key, group);
		}
		group.data.push(f);
	}
	const styleGroups = [...groups.values()];

	function resolveBaseFill(f: TaggedGeoFeature<TProps>): string {
		if (value && colorScale) {
			const v = value(f);
			if (v != null) return colorScale(v);
		}
		return fill ?? cfg.palette[0];
	}

	const featureMarkers: GeoFeaturesMarkerConfig[] = styleGroups.map((group) => ({
		type: 'geo',
		data: group.data,
		fill: (d) => group.style.fill ?? resolveBaseFill(d as TaggedGeoFeature<TProps>),
		fillOpacity: group.style.fillOpacity ?? fillOpacity ?? 1,
		stroke: group.style.stroke ?? stroke ?? cfg.axis.color,
		strokeWidth: group.style.strokeWidth ?? strokeWidth ?? 0.5,
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
