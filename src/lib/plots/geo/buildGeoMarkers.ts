import type { MarkerConfig } from '$lib/types/markers/all';
import type {
  GeoMarkersConfig,
  GeoHoverMarkerConfig,
  GeoFeaturesMarkerConfig,
  GeoGraticuleMarkerConfig,
  GeoSphereMarkerConfig,
  GeoContourMarkerConfig,
} from '$lib/types/markers/geo';
import type { GeoSegmentStyle } from '$lib/types/plots/segments/common';

/** One resolved-style bucket of features, as grouped by `GeoPlot`'s own `styleGroups`. */
export type GeoStyleGroup<TRow> = { style: GeoSegmentStyle; data: TRow[] };

/**
 * `graticule`/`sphere`/`contour` opt into drawing underneath the base map's
 * own fill/stroke instead of on top of it — see each config's own `behind`
 * doc comment.
 */
function isBehindMarker(
  marker: GeoMarkersConfig,
): marker is GeoGraticuleMarkerConfig | GeoSphereMarkerConfig | GeoContourMarkerConfig {
  return (
    (marker.type === 'graticule' || marker.type === 'sphere' || marker.type === 'contour') &&
    marker.behind === true
  );
}

/**
 * Every marker for one `GeoPlot` render, in final draw order: any authored
 * marker with `behind: true`, then the base map itself (one `'geo'` marker
 * per resolved feature style), then the rest of the authored markers in
 * order, with any `hover` marker moved last.
 */
export function buildGeoMarkers<TRow extends Record<string, unknown> & { __id: string }>(args: {
  styleGroups: GeoStyleGroup<TRow>[];
  resolveBaseFill: (d: TRow) => string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  axisColor: string;
  onFeatureClick?: (d: TRow, e: Event) => void;
  markers: GeoMarkersConfig[];
  hoverActive: boolean;
  hoverPointById: Map<string, { row: TRow }>;
  isOverInset: (e: PointerEvent) => boolean;
  setHoverMatch: (rows: TRow[]) => void;
  clearHoverMatch: () => void;
}): MarkerConfig[] {
  const {
    styleGroups,
    resolveBaseFill,
    fillOpacity,
    stroke,
    strokeWidth,
    axisColor,
    onFeatureClick,
    markers,
    hoverActive,
    hoverPointById,
    isOverInset,
    setHoverMatch,
    clearHoverMatch,
  } = args;

  const featureMarkers: GeoFeaturesMarkerConfig[] = styleGroups.map((group) => ({
    type: 'geo',
    data: group.data,
    fill: (d: Record<string, unknown>) => group.style.fill ?? resolveBaseFill(d as TRow),
    fillOpacity: group.style.fillOpacity ?? fillOpacity ?? 1,
    stroke: group.style.stroke ?? stroke ?? axisColor,
    strokeWidth: group.style.strokeWidth ?? strokeWidth ?? 0.5,
    onclick: onFeatureClick ? (e: Event, d: Record<string, unknown>) => onFeatureClick(d as TRow, e) : undefined,
    onpointerenter: hoverActive
      ? (e: Event, d: Record<string, unknown>) => {
          if (isOverInset(e as PointerEvent)) return;
          const hp = hoverPointById.get((d as TRow).__id);
          if (hp) setHoverMatch([hp.row]);
        }
      : undefined,
    onpointerleave: hoverActive
      ? (e: Event) => {
          if (isOverInset(e as PointerEvent)) return;
          clearHoverMatch();
        }
      : undefined,
  }));

  const behindMarkers = markers.filter(isBehindMarker);
  const frontMarkers = markers.filter((m) => !isBehindMarker(m) && m.type !== 'geo-hover');
  const hoverMarker = markers.find((m): m is GeoHoverMarkerConfig => m.type === 'geo-hover');

  return [...behindMarkers, ...featureMarkers, ...frontMarkers, ...(hoverMarker ? [hoverMarker] : [])];
}
