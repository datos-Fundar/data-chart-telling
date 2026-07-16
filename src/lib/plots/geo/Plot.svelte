<script lang="ts" generics="TProps extends Record<string, unknown>">
  import { SvelteMap } from 'svelte/reactivity';
  import { Geo, Graticule, Sphere, Dot, Vector, Contour } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { resolveFeatureStyle } from '$lib/plots/utils/geoSegments';
  import {
    geometryCentroid,
    geometryPartCentroids,
    filterGeometryParts,
    defaultFeatureId,
    greatCircleInterpolate,
  } from '$lib/plots/utils/geoAccessors';
  import { isTopology, topologyToGeoJson } from '$lib/plots/utils/topojson';
  import { makeColorScale } from '$lib/utils/color';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { numericMargin } from '$lib/layout/plot/margins';
  import GeoPlotLayout from '$lib/layout/geo/GeoPlotLayout.svelte';
  import InsetMarker from './InsetMarker.svelte';
  import type { GeoPlotProps } from '$lib/types/plots/geo/props';
  import type { GeoFeature } from '$lib/types/plots/geo/common';
  import type { GeoSegmentStyle } from '$lib/types/plots/geo/styles';
  import type { GeoHoverMarkerConfig, GeoDotMarker, GeoInsetMarker } from '$lib/types/plots/geo/markers';

  /**
   * A map, rendered from GeoJSON (or, optionally, TopoJSON — see
   * `$lib/plots/utils/topojson`). Unlike the other plot kinds there's no x/y/z
   * axis pair: `data` IS the map. `segments` styles features by id (e.g.
   * `segments.argentina`), `value` + `scales.color`/`styles.colors` drive a
   * continuous choropleth ramp (mirrors heatmap's `z`/`colors` pattern), and
   * everything drawn on top — points, arrows, geodesic links, contours,
   * graticule/sphere — is a `markers` entry.
   */
  type TaggedFeature = GeoFeature<TProps> & { __id: string; __cx: number; __cy: number };

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
    margins,
    tooltip = undefined,
  }: GeoPlotProps<TProps> = $props();

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
   * Tags each feature with a plain enumerable `__id`/`__cx`/`__cy` by
   * spreading into a fresh object (never mutating the original — Svelte 5
   * forbids mutating state read inside a `$derived`, and `data` may already
   * be a reactive proxy) — required because svelteplot's `<Pointer>`
   * shallow-clones matched rows, so per-row metadata needed at hover-match
   * time must live as an own enumerable property on the object itself, not a
   * side `Map` keyed by identity.
   *
   * Untouched by `excludeParts` — this is the full geometry, passed to
   * `InsetMarker` as-is, so an inset can show a part regardless of whether
   * `excludeParts` also hides that same part from the main map's own
   * rendering below (see `features`).
   */
  const allFeatures = $derived.by((): TaggedFeature[] =>
    rawFeatures.map((f) => {
      const [cx, cy] = geometryCentroid(f.geometry);
      return { ...f, __id: getFeatureId(f), __cx: cx, __cy: cy } as TaggedFeature;
    }),
  );

  /**
   * `allFeatures`, reduced per `excludeParts` — this is what actually
   * renders (`styleGroups`/`<Geo>` below) and what `hoverCandidates` derives
   * from. A feature reduced to no parts at all is dropped entirely.
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
    const proj = scales.projection;
    const name = typeof proj === 'string' ? proj : proj?.type;
    if (name && name !== 'mercator' && name !== 'transverse-mercator') {
      console.warn(
        `GeoPlot: styles.tileLayer only renders correctly with a mercator-family projection — got "${name}". Rendering anyway.`,
      );
    }
  });

  const resolvedProjection = $derived(scales.projection ?? (styles.tileLayer ? 'mercator' : undefined));

  /**
   * Same margin resolution `GeoPlotLayout` feeds svelteplot's `<Plot
   * margin>` — needed here too because an `inset` marker's box (see below)
   * is positioned in the same absolute SVG coordinate space as the map
   * itself. svelteplot bakes margins into the projection's own
   * scale/translate rather than wrapping children in a translating `<g>`, so
   * the map's actual content sits inset by this amount from every edge of
   * `width`/`height` — an inset box computed against the raw, un-inset
   * `width`/`height` would be measuring its own `margin` gap from the wrong
   * edge, landing outside the map's visible frame once the map itself fills
   * that frame tightly (as an auto-fitting projection does).
   */
  const insetContentBox = $derived.by(() => {
    const top = numericMargin('top', margins?.top ?? cfg.margins.top);
    const right = numericMargin('right', margins?.right ?? cfg.margins.right);
    const bottom = numericMargin('bottom', margins?.bottom ?? cfg.margins.bottom);
    const left = numericMargin('left', margins?.left ?? cfg.margins.left);
    return { left, top, width: Math.max(0, width - left - right), height: Math.max(0, height - top - bottom) };
  });

  // ── Choropleth color scale (mirrors heatmap's styles.colors/scales.z) ────
  const minColor = $derived(styles.colors?.min ?? cfg.continuous.min);
  const maxColor = $derived(styles.colors?.max ?? cfg.continuous.max);

  const valueDomain = $derived.by((): [number, number] | null => {
    if (scales.color?.domain) return scales.color.domain;
    if (!value) return null;
    const vals = features.map((f) => value(f)).filter((v): v is number => v != null);
    return vals.length ? [Math.min(...vals), Math.max(...vals)] : null;
  });

  const colorScale = $derived(
    valueDomain ? makeColorScale(valueDomain[0], valueDomain[1], minColor, maxColor) : null,
  );

  function resolveBaseFill(f: TaggedFeature): string {
    if (value && colorScale) {
      const v = value(f);
      if (v != null) return colorScale(v);
    }
    return styles.fill ?? cfg.palette[0];
  }

  /** Per-marker color ramp for a `dot` marker's `value` channel — independent of the base map's own choropleth ramp. */
  function makeDotColorScale(marker: GeoDotMarker): ((v: number) => string) | null {
    if (!marker.value) return null;
    const getValue = resolveAccessor(marker.value);
    const vals = marker.data.map((d) => Number(getValue(d))).filter((v) => Number.isFinite(v));
    if (!vals.length) return null;
    const domain: [number, number] = [Math.min(...vals), Math.max(...vals)];
    return makeColorScale(
      domain[0],
      domain[1],
      marker.style?.colors?.min ?? cfg.continuous.min,
      marker.style?.colors?.max ?? cfg.continuous.max,
    );
  }

  // ── Per-feature style resolution, grouped by distinct resolved style ─────
  // (one <Geo> call per group — mirrors heatmap's styleGroups: svelteplot's
  // shared numeric-scale machinery collapses a per-row fillOpacity/strokeWidth
  // *accessor* to a single value, so literal per-call constants are required.)
  function getFeatureStyle(f: TaggedFeature): GeoSegmentStyle {
    return resolveFeatureStyle<GeoSegmentStyle>(segments, f.__id);
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

  // ── Hover / tooltip — always nearest base-map feature (2-D, punctual) ────
  const hoverMarkerConfig = $derived(markers.find((m): m is GeoHoverMarkerConfig => m.type === 'hover'));

  $effect(() => {
    if (hoverMarkerConfig?.strategy === 'nearest-point') {
      console.warn(
        "GeoPlot: the hover marker's strategy 'nearest-point' isn't implemented yet — falling back to 'nearest-feature'.",
      );
    }
  });

  /**
   * Hover/click candidates — like `features`, but one row per disjoint
   * geometry part instead of per feature, so a multi-part feature's hover
   * point isn't stranded somewhere between its parts (see
   * `geometryPartCentroids`). Only used for hover matching (`GeoPlotLayout`'s
   * `data`/`hoverPoints`) — `<Geo>` itself still renders from
   * `features`/`styleGroups`, one entry per feature, unaffected by this.
   */
  const hoverCandidates = $derived.by((): TaggedFeature[] =>
    features.flatMap((f) => geometryPartCentroids(f.geometry).map(([cx, cy]) => ({ ...f, __cx: cx, __cy: cy }))),
  );

  const hoverPoints = $derived(hoverCandidates.map((f) => ({ x: f.__cx, y: f.__cy, row: f, label: f.__id })));
  const hoverGetX = (f: TaggedFeature) => f.__cx;
  const hoverGetY = (f: TaggedFeature) => f.__cy;
</script>

<GeoPlotLayout
  {width}
  {height}
  {margins}
  projection={resolvedProjection}
  data={hoverCandidates}
  getX={hoverGetX}
  getY={hoverGetY}
  {hoverPoints}
  label={(f) => f.__id}
  {tooltip}
  hoverMarker={hoverMarkerConfig}
  zoom={styles.zoom ?? false}
  tileLayer={styles.tileLayer}
>
    {#each styleGroups as group (JSON.stringify(group.style))}
      <Geo
        data={group.data}
        fill={(d: TaggedFeature) => group.style.fill ?? resolveBaseFill(d)}
        fillOpacity={group.style.fillOpacity ?? styles.fillOpacity ?? 1}
        stroke={group.style.stroke ?? styles.stroke ?? cfg.axis.color}
        strokeWidth={group.style.strokeWidth ?? styles.strokeWidth ?? 0.5}
        style="vector-effect: non-scaling-stroke"
        onclick={styles.onFeatureClick
          ? (e: Event, d: TaggedFeature) => styles.onFeatureClick?.(d, e)
          : undefined}
      />
    {/each}

    {#each markers as marker, i (marker.type + '-' + i)}
      {#if marker.type === 'graticule'}
        <Graticule
          step={marker.step}
          stepX={marker.stepX}
          stepY={marker.stepY}
          stroke={marker.style?.stroke ?? 'currentColor'}
          strokeWidth={marker.style?.strokeWidth ?? 0.5}
          strokeOpacity={marker.style?.strokeOpacity ?? 0.3}
          strokeDasharray={marker.style?.strokeDasharray}
          style="vector-effect: non-scaling-stroke"
        />
      {:else if marker.type === 'sphere'}
        <Sphere
          fill={marker.style?.fill}
          fillOpacity={marker.style?.fillOpacity}
          stroke={marker.style?.stroke ?? 'currentColor'}
          strokeWidth={marker.style?.strokeWidth ?? 1}
          style="vector-effect: non-scaling-stroke"
        />
      {:else if marker.type === 'dot'}
        {@const getDotValue = marker.value ? resolveAccessor(marker.value) : null}
        {@const dotColorScale = getDotValue ? makeDotColorScale(marker) : null}
        <Dot
          data={marker.data}
          x={marker.x}
          y={marker.y}
          r={marker.r ?? marker.style?.dotRadius ?? 4}
          fill={dotColorScale && getDotValue
            ? (d: Record<string, unknown>) => dotColorScale(Number(getDotValue(d)))
            : (marker.style?.dotFill ?? cfg.palette[0])}
          fillOpacity={marker.style?.dotFillOpacity ?? 1}
          stroke={marker.style?.dotStroke}
          strokeWidth={marker.style?.dotStrokeWidth}
        />
      {:else if marker.type === 'vector'}
        <Vector
          data={marker.data}
          x={marker.x}
          y={marker.y}
          length={marker.length}
          rotate={marker.rotate}
          shape={marker.shape ?? 'arrow'}
          anchor={marker.anchor}
          fill={marker.style?.fill ?? 'currentColor'}
          stroke={marker.style?.stroke}
          strokeWidth={marker.style?.strokeWidth}
        />
      {:else if marker.type === 'link'}
        {@const getX1 = resolveAccessor(marker.x1)}
        {@const getY1 = resolveAccessor(marker.y1)}
        {@const getX2 = resolveAccessor(marker.x2)}
        {@const getY2 = resolveAccessor(marker.y2)}
        {@const linkFeatures = marker.data.map((d) => ({
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates:
              marker.curve === 'linear'
                ? [
                    [Number(getX1(d)), Number(getY1(d))],
                    [Number(getX2(d)), Number(getY2(d))],
                  ]
                : greatCircleInterpolate(Number(getX1(d)), Number(getY1(d)), Number(getX2(d)), Number(getY2(d))),
          },
        }))}
        <Geo
          class="link"
          data={linkFeatures}
          fill="none"
          stroke={marker.style?.stroke ?? 'currentColor'}
          strokeWidth={marker.style?.strokeWidth ?? 1}
          strokeOpacity={marker.style?.strokeOpacity}
          strokeDasharray={marker.style?.strokeDasharray}
          style="vector-effect: non-scaling-stroke"
        />
      {:else if marker.type === 'contour'}
        <Contour
          class="contour"
          data={marker.data}
          x={marker.x}
          y={marker.y}
          value={marker.value}
          thresholds={marker.thresholds}
          fill={marker.fill ?? 'none'}
          stroke={marker.stroke ?? 'currentColor'}
          strokeWidth={marker.style?.strokeWidth}
          fillOpacity={marker.style?.fillOpacity}
          strokeOpacity={marker.style?.strokeOpacity}
          blur={marker.blur}
          interpolate={marker.interpolate}
        />
      {:else if marker.type === 'component'}
        <marker.component {...marker.props} data={marker.data ?? features} />
      {:else if marker.type === 'inset'}
        <InsetMarker
          marker={marker as GeoInsetMarker<TProps>}
          features={allFeatures}
          width={insetContentBox.width}
          height={insetContentBox.height}
          left={insetContentBox.left}
          top={insetContentBox.top}
          defaultFill={cfg.palette[0]}
        />
      {/if}
    {/each}
</GeoPlotLayout>
