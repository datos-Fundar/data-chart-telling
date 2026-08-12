<script lang="ts" generics="TProps extends Record<string, unknown>">
  import { SvelteMap } from 'svelte/reactivity';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { resolveFeatureStyle } from '$lib/plots/utils/geoSegments';
  import { geometryCentroid, filterGeometryParts, defaultFeatureId } from '$lib/plots/utils/geoAccessors';
  import { isTopology, topologyToGeoJson } from '$lib/plots/utils/topojson';
  import { makeColorScale } from '$lib/utils/color';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
  import { disabledFillOverride } from '$lib/plots/utils/legendDisabled';
  import { GEO_MARGIN_ESTIMATE } from '$lib/layout/coordinates/margins';
  import { buildGeoMarkers } from '$lib/plots/geo/buildGeoMarkers';
  import { hasHoverMarker } from '$lib/layout/tooltip/utils';
  import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
  import type { BasePlotProps } from '$lib/types/plots/props';
  import type { GeoScalesConfig, CoordinatesConfig } from '$lib/types/layout/coordinates';
  import type { GeoFeature, GeoDataProps } from '$lib/types/plots/data/geo';
  import type { GeoStylesConfig } from '$lib/types/layout/styles';
  import type { GeoSegmentStyle } from '$lib/types/plots/segments/common';
  import type { GeoMarkersConfig } from '$lib/types/markers/geo';

  /**
   * A map, rendered from GeoJSON or TopoJSON. Unlike the other plot kinds
   * there's no x/y/z axis pair: `data` IS the map. `segments` styles
   * features by id; `value` + `scales.color`/`styles.colors` drive a
   * continuous choropleth ramp. Everything drawn on top — points, arrows,
   * links, contours, graticule/sphere — is a `markers` entry, assembled by
   * `buildGeoMarkers` and routed through `GeometryLayout`.
   */
  type TaggedFeature = GeoFeature<TProps> & { __id: string; __cx: number; __cy: number };

  type Props = BasePlotProps<
    GeoDataProps<TProps>,
    GeoFeature<TProps>,
    GeoStylesConfig<TProps>,
    GeoSegmentStyle,
    GeoMarkersConfig,
    GeoScalesConfig,
    CoordinatesConfig
  >;

  let {
    data,
    object,
    featureId,
    value,
    excludeParts,
    width,
    height,
    styles = {},
    segments = {},
    markers = [],
    scales = {},
    coordinates = {},
    margins,
    tooltip = undefined,
  }: Props = $props();

  const cfg = $derived(getConfiguration());

  // ── Resolve data: GeoJSON is synchronous, TopoJSON is converted async ────
  let topoFeatures = $state<GeoFeature<TProps>[] | null>(null);

  $effect(() => {
    if (!isTopology(data)) return;
    if (!object) {
      console.warn('GeoPlot: `data` is a TopoJSON Topology but no `object` key was given — nothing will render.');
      topoFeatures = [];
      return;
    }
    let cancelled = false;
    topologyToGeoJson<TProps>(data, object)
      .then((resolved) => {
        if (!cancelled) topoFeatures = resolved;
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn(err instanceof Error ? err.message : String(err));
          topoFeatures = [];
        }
      });
    return () => {
      cancelled = true;
    };
  });

  const rawFeatures = $derived.by((): GeoFeature<TProps>[] => {
    if (isTopology(data)) return topoFeatures ?? [];
    if (Array.isArray(data)) return data;
    // `FeatureCollection.features` is GeoJSON's own `Feature<G, P>[]`, without
    // the `Record<string, unknown>` intersection `GeoFeature` adds to satisfy
    // this package's generic row-type bound — safe to assert, since every
    // property `GeoFeature` promises is already present.
    return data.features as GeoFeature<TProps>[];
  });

  const getFeatureId = $derived(
    featureId ? resolveAccessor<GeoFeature<TProps>>(featureId) : defaultFeatureId<TProps>,
  );

  /**
   * Tags each feature with a plain enumerable `__id`/`__cx`/`__cy`, so
   * per-row metadata (feature id for style/hover lookups, centroid for
   * positioning) lives as an own property on the object itself rather than a
   * side lookup. Untouched by `excludeParts`: passed to `InsetMarker` as-is,
   * so an inset can show a part the main map's own rendering (`features`,
   * below) excludes.
   */
  const allFeatures = $derived.by((): TaggedFeature[] =>
    rawFeatures.map((f) => {
      const [cx, cy] = geometryCentroid(f.geometry);
      return { ...f, __id: getFeatureId(f), __cx: cx, __cy: cy } as TaggedFeature;
    }),
  );

  /**
   * `allFeatures`, reduced per `excludeParts` — this is what actually
   * renders (`styleGroups`/the base `'geo'` marker below) and what
   * `hoverPoints` derives from. A feature reduced to no parts at all is
   * dropped entirely.
   */
  const features = $derived.by((): TaggedFeature[] => {
    if (!excludeParts) return allFeatures;
    return allFeatures.flatMap((f) => {
      const geometry = filterGeometryParts(f.geometry, (part) => !excludeParts(part, f));
      if (!geometry) return [];
      const [cx, cy] = geometryCentroid(geometry);
      return [{ ...f, geometry, __cx: cx, __cy: cy } as TaggedFeature];
    });
  });

  // ── Tile-layer / projection compatibility ────────────────────────────────
  $effect(() => {
    if (!styles.tileLayer) return;
    const proj = coordinates.projection;
    const name = typeof proj === 'string' ? proj : proj?.type;
    if (name && name !== 'mercator' && name !== 'transverse-mercator') {
      console.warn(
        `GeoPlot: styles.tileLayer only renders correctly with a mercator-family projection — got "${name}". Rendering anyway.`,
      );
    }
  });

  /**
   * `coordinates.projection`, defaulted to `'mercator'` when unset and
   * `styles.tileLayer` is active (the only projection family `TileLayer`
   * renders correctly under) — folded in here, before `coordinates` reaches
   * `BasePlotLayout`/`CoordinatesLayout`, since neither knows about
   * `styles.tileLayer`.
   */
  const resolvedCoordinates = $derived.by((): CoordinatesConfig => ({
    ...coordinates,
    projection: coordinates.projection ?? (styles.tileLayer ? 'mercator' : undefined),
  }));

  /**
   * `styles`, with `features` tacked onto `tileLayer` (never author-facing —
   * `GeoTileLayerConfig` doesn't declare it) so `StylesLayout` can compute
   * the tile layer's auto-fit bounds without raw geometry threaded through
   * as a separate prop. `excludeParts`-reduced `features`, matching what
   * actually renders.
   */
  const resolvedStyles = $derived.by(() =>
    styles.tileLayer ? { ...styles, tileLayer: { ...styles.tileLayer, features } } : styles,
  );

  // ── Choropleth color scale (mirrors heatmap's styles.colors/scales.z) ────
  const minColor = $derived(styles.colors?.min ?? cfg.continuous.min);
  const maxColor = $derived(styles.colors?.max ?? cfg.continuous.max);

  const valueDomain = $derived.by((): [number, number] | null => {
    if (scales.color?.domain) return scales.color.domain;
    if (!value) return null;
    const vals = features.map((f) => value(f)).filter((v): v is number => v != null);
    return vals.length ? [Math.min(...vals), Math.max(...vals)] : null;
  });

  // ── Legend-driven range filter (mirrors HeatmapPlot's own) ────────────────
  const legendInteraction = $derived(getLegendInteraction());
  const range = $derived(legendInteraction?.continuousRange);
  const effectiveDomain = $derived.by((): [number, number] | null => {
    if (!valueDomain) return null;
    return range && range.mode === 'rescale' ? [range.min, range.max] : valueDomain;
  });

  const colorScale = $derived(
    effectiveDomain ? makeColorScale(effectiveDomain[0], effectiveDomain[1], minColor, maxColor) : null,
  );

  function resolveBaseFill(f: TaggedFeature): string {
    if (value && colorScale) {
      const v = value(f);
      if (v != null) return colorScale(v);
    }
    return styles.fill ?? cfg.palette[0];
  }

  function rangeFilteredStyle(base: GeoSegmentStyle, f: TaggedFeature): GeoSegmentStyle {
    const r = range;
    if (r == null || !value) return base;
    const v = value(f);
    if (v == null || (v >= r.min && v <= r.max)) return base;
    return { ...base, ...disabledFillOverride(r.disabledStyle) };
  }

  // ── Per-feature style resolution, grouped by distinct resolved style ─────
  // (one `'geo'` marker per group — mirrors heatmap's styleGroups: svelteplot's
  // shared numeric-scale machinery collapses a per-row fillOpacity/strokeWidth
  // *accessor* to a single value, so literal per-call constants are required.)
  function getFeatureStyle(f: TaggedFeature): GeoSegmentStyle {
    return rangeFilteredStyle(resolveFeatureStyle<GeoSegmentStyle>(segments, f.__id), f);
  }

  type StyleGroup = { style: GeoSegmentStyle; data: TaggedFeature[] };
  const styleGroups = $derived.by((): StyleGroup[] => {
    const groups = new SvelteMap<string, StyleGroup>();
    for (const f of features) {
      const style = getFeatureStyle(f);
      const key = JSON.stringify(style);
      let group = groups.get(key);
      if (!group) {
        group = { style, data: [] };
        groups.set(key, group);
      }
      group.data.push(f);
    }
    return [...groups.values()];
  });

  // A feature outside the active range is dimmed in place, but never
  // surfaces in hover/tooltip — it's simply absent from the candidate list.
  const hoverPoints = $derived(
    features
      .filter((f) => {
        const r = range;
        if (r == null || !value) return true;
        const v = value(f);
        return v == null || (v >= r.min && v <= r.max);
      })
      .map((f) => ({ x: f.__cx, y: f.__cy, row: f, label: f.__id })),
  );
  const hoverGetX = (f: TaggedFeature) => f.__cx;
  const hoverGetY = (f: TaggedFeature) => f.__cy;

  /**
   * `hoverPoints` keyed by feature `__id`, looked up from the exact feature
   * the browser's own SVG hit-testing resolved a pointer event to (see the
   * base `'geo'` marker's `onpointerenter`, built by `buildGeoMarkers`). A
   * feature absent here was filtered out of `hoverPoints` and correctly
   * produces no match.
   */
  const hoverPointById = $derived.by(() => {
    const map = new SvelteMap<string, (typeof hoverPoints)[number]>();
    for (const p of hoverPoints) map.set(p.row.__id, p);
    return map;
  });

  const hoverActive = $derived(tooltip != null || hasHoverMarker(markers));

  const hover = $derived({
    active: hoverActive,
    points: hoverPoints,
    label: (f: TaggedFeature) => f.__id,
    strategy: 'punctual' as const,
    // A map has no axis to draw a crosshair rule against — 'punctual' here
    // only means "exact XY hover match", unlike heatmap's own use of it.
    crosshair: false,
    sync: tooltip?.sync ?? false,
    tooltip,
    exclude: isOverInset,
    // A feature's true visual center can sit far from where the cursor
    // actually is on a large/irregular shape (e.g. an elongated province) —
    // 'contains' matches the feature the cursor is really over, via the
    // browser's own SVG hit-testing on each rendered feature path, rather
    // than 'nearest' centroid distance.
    pointMatching: 'contains' as const,
  });

  /**
   * The main map's own hover must never fire while the cursor is over an
   * `inset` marker's panel, which draws at its own scale/projection.
   * Checked via `e.target` (tagged with the `dct-geo-inset` ancestor class
   * by `InsetMarker`'s own hit-test elements) rather than precomputed pixel
   * bounds, since the browser's own hit-testing already accounts for any
   * scale mismatch between `<Plot>`'s props and its rendered viewBox.
   */
  function isOverInset(e: PointerEvent): boolean {
    return (e.target as Element | null)?.closest?.('.dct-geo-inset') != null;
  }
</script>

<!--
  `x`/`y`: pins the plot's generic linear scales to the full lon/lat range.
  Every geo-aware mark routes through the active projection instead, except
  svelteplot's `Contour`, whose grid reads `plot.scales.x`/`y` directly —
  this keeps a `contour` marker aligned with the map under it.
-->
<BasePlotLayout
  {width}
  {height}
  data={features}
  getX={hoverGetX}
  getY={hoverGetY}
  {hover}
  x={{ domain: [-180, 180] }}
  y={{ domain: [90, -90] }}
  coordinates={resolvedCoordinates}
  {margins}
  marginEstimate={GEO_MARGIN_ESTIMATE}
  styles={resolvedStyles}
  markers={({ setHoverMatch, clearHoverMatch }) =>
    buildGeoMarkers({
      styleGroups,
      resolveBaseFill,
      fillOpacity: styles.fillOpacity,
      stroke: styles.stroke,
      strokeWidth: styles.strokeWidth,
      axisColor: cfg.axis.color,
      onFeatureClick: styles.onFeatureClick,
      markers,
      hoverActive,
      hoverPointById,
      isOverInset,
      setHoverMatch,
      clearHoverMatch,
    })}
  geoAllFeatures={allFeatures}
/>
