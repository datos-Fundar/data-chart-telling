<script lang="ts" generics="TProps extends Record<string, unknown>">
  import { SvelteMap } from 'svelte/reactivity';
  import { Geo, Graticule, Sphere, Dot, Vector, Contour } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { resolveFeatureStyle } from '$lib/plots/utils/geoSegments';
  import {
    geometryCentroid,
    geometryLonLatBounds,
    geometryPartCentroids,
    filterGeometryParts,
    defaultFeatureId,
    greatCircleInterpolate,
  } from '$lib/plots/utils/geoAccessors';
  import { isTopology, topologyToGeoJson } from '$lib/plots/utils/topojson';
  import { makeColorScale } from '$lib/utils/color';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
  import { disabledFillOverride } from '$lib/plots/utils/legendDisabled';
  import { GEO_MARGIN_ESTIMATE } from '$lib/layout/plot/margins';
  import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
  import GeoLayout from '$lib/layout/geo/GeoLayout.svelte';
  import { resolveProjection } from '$lib/layout/geo/resolveProjection';
  import HoverMarker from '$lib/markers/HoverMarker.svelte';
  import { createGeoZoom } from '$lib/plots/geo/zoom.svelte';
  import { createGeoRotate, type GeoRotate } from '$lib/plots/geo/rotate.svelte';
  import InsetMarker from '$lib/markers/inset/InsetMarker.svelte';
  import ContourClipMarker from '$lib/markers/ContourClipMarker.svelte';
  import type { BasePlotProps, GeoScalesConfig } from '$lib/types/plots/props';
  import type { GeoFeature, GeoDataProps } from '$lib/types/plots/data/geo';
  import type { GeoStyles } from '$lib/types/plots/styles/geo';
  import type { GeoSegmentStyle } from '$lib/types/plots/segments/common';
  import type { GeoMarker, GeoHoverMarkerConfig, GeoDotMarkerConfig, GeoInsetMarkerConfig } from '$lib/types/markers/geo';

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

  type Props = BasePlotProps<
    GeoDataProps<TProps>,
    GeoFeature<TProps>,
    GeoStyles<TProps>,
    GeoSegmentStyle,
    GeoMarker,
    GeoScalesConfig
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

  const dataLonLatBounds = $derived.by((): [number, number, number, number] | null => {
    if (!styles.tileLayer) return null;
    let minLon = Infinity;
    let maxLon = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;
    for (const f of features) {
      const b = geometryLonLatBounds(f.geometry);
      if (!b) continue;
      if (b[0] < minLon) minLon = b[0];
      if (b[2] > maxLon) maxLon = b[2];
      if (b[1] < minLat) minLat = b[1];
      if (b[3] > maxLat) maxLat = b[3];
    }
    return minLon === Infinity ? null : [minLon, minLat, maxLon, maxLat];
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

  /** Per-marker color ramp for a `dot` marker's `value` channel — independent of the base map's own choropleth ramp. */
  function makeDotColorScale(marker: GeoDotMarkerConfig): ((v: number) => string) | null {
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

  /**
   * Hover/click candidates — like `features`, but one row per disjoint
   * geometry part instead of per feature, so a multi-part feature's hover
   * point isn't stranded somewhere between its parts (see
   * `geometryPartCentroids`). Only used for hover matching (`BasePlotLayout`'s
   * `data`/`hoverPoints`) — `<Geo>` itself still renders from
   * `features`/`styleGroups`, one entry per feature, unaffected by this.
   */
  const hoverCandidates = $derived.by((): TaggedFeature[] =>
    features.flatMap((f) => geometryPartCentroids(f.geometry).map(([cx, cy]) => ({ ...f, __cx: cx, __cy: cy }))),
  );

  // A feature outside the active range is dimmed in place, but never
  // surfaces in hover/tooltip — it's simply absent from the candidate list.
  const hoverPoints = $derived(
    hoverCandidates
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
   * One `hoverPoints` entry per feature `__id` (first part wins — every part
   * of the same feature shares the same `row`, so any one is equally good
   * for tooltip/highlight purposes). Looked up from the exact feature the
   * browser's own SVG hit-testing resolved a pointer event to (see the
   * `<Geo onpointerenter>` below) — the actual match, not an approximation
   * of it, unlike the bounding-box-centroid distance search this replaces.
   * A feature absent here was filtered out of `hoverPoints` (out of the
   * active legend range) and correctly produces no match.
   */
  const hoverPointById = $derived.by(() => {
    const map = new SvelteMap<string, (typeof hoverPoints)[number]>();
    for (const p of hoverPoints) {
      if (!map.has(p.row.__id)) map.set(p.row.__id, p);
    }
    return map;
  });

  /**
   * `markers` otherwise always render after (on top of) the base map's own
   * `styleGroups`, regardless of array order — a marker opts into drawing
   * underneath it instead by setting `behind: true` (see e.g.
   * `GeoSphereMarkerConfig.behind`).
   */
  function isBehindMarker(marker: GeoMarker): boolean {
    return (
      (marker.type === 'graticule' || marker.type === 'sphere' || marker.type === 'contour') &&
      marker.behind === true
    );
  }

  const hoverMarkerConfig = $derived(markers.find((m): m is GeoHoverMarkerConfig => m.type === 'hover'));

  $effect(() => {
    if (hoverMarkerConfig?.strategy === 'nearest-point') {
      console.warn(
        "GeoPlot: the hover marker's strategy 'nearest-point' isn't implemented yet — falling back to 'nearest-feature'.",
      );
    }
  });

  const hoverActive = $derived(tooltip != null || hoverMarkerConfig != null);

  const hover = $derived({
    active: hoverActive,
    points: hoverPoints,
    label: (f: TaggedFeature) => f.__id,
    strategy: 'punctual' as const,
    sync: tooltip?.sync ?? false,
    tooltip,
    exclude: isOverInset,
    // A feature's true visual center can sit far from where the cursor
    // actually is on a large/irregular shape (e.g. an elongated province) —
    // 'contains' matches the feature the cursor is really over, via the
    // browser's own SVG hit-testing on each rendered feature path (see the
    // `<Geo onpointerenter>` below), rather than 'nearest' centroid distance.
    match: 'contains' as const,
  });

  // ── Projection ────────────────────────────────────────────────────────────
  const resolvedProjection = $derived(
    resolveProjection(scales.projection ?? (styles.tileLayer ? 'mercator' : undefined), hoverCandidates),
  );

  // ── Pan / zoom / rotate — owned here (not GeoLayout) since the resulting
  // rotated projection must reach `BasePlotLayout`'s own `<Plot projection>`
  // prop, and a component nested *inside* that `<Plot>` (as GeoLayout is)
  // has no way to reach back out to a prop on its own ancestor. GeoLayout
  // only renders the *result* (`zoomTransform`) as its `<g transform>`. ────
  let containerEl = $state<HTMLDivElement>();
  const zoomEnabled = $derived(styles.zoom !== false && styles.zoom != null);
  const zoomConfig = $derived(typeof styles.zoom === 'object' ? styles.zoom : undefined);

  /**
   * Orthographic (and other azimuthal, hemisphere-style) projections don't
   * gain anything from drag-to-*pan* — panning just slides the same globe a
   * few pixels within the frame — so when `zoom` is enabled on one, drag
   * instead rotates the globe (`createGeoRotate`) and wheel/pinch keeps
   * scaling it (`createGeoZoom`, with its own drag disabled below so the two
   * gestures don't fight over the same pointer events).
   */
  const projectionType = $derived(
    typeof resolvedProjection === 'string' ? resolvedProjection : resolvedProjection?.type,
  );
  const rotateEnabled = $derived(zoomEnabled && projectionType === 'orthographic');
  const baseRotate = $derived.by((): GeoRotate => {
    const configured = typeof resolvedProjection === 'object' ? resolvedProjection?.rotate : undefined;
    return [configured?.[0] ?? 0, configured?.[1] ?? 0, configured?.[2] ?? 0];
  });

  const geoZoom = createGeoZoom({
    enabled: () => zoomEnabled,
    config: () => zoomConfig,
    node: () => containerEl ?? null,
    disableDrag: () => rotateEnabled,
  });

  const geoRotate = createGeoRotate({
    enabled: () => rotateEnabled,
    baseRotate: () => baseRotate,
    scale: () => geoZoom.transform.k,
    node: () => containerEl ?? null,
  });

  const finalProjection = $derived.by(() => {
    if (!rotateEnabled) return resolvedProjection;
    return {
      ...(typeof resolvedProjection === 'string' ? { type: resolvedProjection } : resolvedProjection),
      rotate: geoRotate.rotate,
    };
  });

  /**
   * This plot's own hover must never fire while the cursor is actually over
   * an `inset` marker's panel — an inset draws its own content at its own
   * scale/projection, so the main map's `Pointer` has no way to know it's
   * there and would otherwise still match/show whatever main-map feature
   * happens to be nearest that screen position underneath the inset.
   *
   * Checked via `e.target` (which `InsetMarker`'s own hit-test `<rect>`, or
   * one of its feature `<path>`s, tags with the `dct-geo-inset` ancestor —
   * see `InsetMarker.svelte`) rather than by comparing pixel coordinates against a
   * precomputed inset box: svelteplot's `<Plot>` doesn't necessarily render
   * at a 1:1 scale between its `width`/`height` props and actual client
   * pixels (its internal `viewBox` can differ), which would silently desync
   * any independently-computed pixel math from what's really on screen. The
   * browser's own hit-testing has no such problem — it already resolves
   * `e.target` against whatever is actually painted, accounting for any such
   * scaling automatically.
   */
  function isOverInset(e: PointerEvent): boolean {
    return (e.target as Element | null)?.closest?.('.dct-geo-inset') != null;
  }
</script>

{#snippet marker_(marker: GeoMarker, numericMargins: { top: number; right: number; bottom: number; left: number })}
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
        <!--
          No `fill` prop here, deliberately: svelteplot's channel resolution
          (`toChannelOption`) treats *any* string value — including the
          literal `'none'` this used to pass — as scale-worthy unless it
          parses as a real CSS color, so `fill="none"` was getting run
          through the plot's color scale and painted an arbitrary category
          color instead of staying unfilled (confirmed by inspecting the
          rendered DOM). Omitting the prop entirely leaves svelteplot's own
          per-mark default in place, which is `fill: none` for an unfilled
          channel — the outcome this mark actually wants, without the buggy
          detour through the color scale.
        -->
        <Geo
          class="link"
          data={linkFeatures}
          stroke={marker.style?.stroke ?? 'currentColor'}
          strokeWidth={marker.style?.strokeWidth ?? 1}
          strokeOpacity={marker.style?.strokeOpacity}
          strokeDasharray={marker.style?.strokeDasharray}
          style="vector-effect: non-scaling-stroke"
        />
      {:else if marker.type === 'contour'}
        <!--
          `fill`/`stroke`: no `?? 'none'` fallback here, deliberately — same
          bug as the `link` marker above. Omitting the prop when
          `marker.fill` is unset leaves svelteplot's own per-mark default in
          place (`fill="none"`, per Contour's own doc comment), instead of
          running the literal string `'none'` through the plot's color scale
          (`'none'` isn't a recognized CSS color, so svelteplot doesn't treat
          it as a literal output value the way it does e.g. `'currentColor'`).
        -->
        <ContourClipMarker mode={marker.clip} {features}>
          <Contour
            class="contour"
            data={marker.data}
            x={marker.x}
            y={marker.y}
            value={marker.value}
            thresholds={marker.thresholds}
            fill={marker.fill}
            stroke={marker.stroke ?? 'currentColor'}
            strokeWidth={marker.style?.strokeWidth}
            fillOpacity={marker.style?.fillOpacity}
            strokeOpacity={marker.style?.strokeOpacity}
            blur={marker.blur}
            interpolate={marker.interpolate}
          />
        </ContourClipMarker>
      {:else if marker.type === 'component'}
        <marker.component {...marker.props} data={marker.data ?? features} />
      {:else if marker.type === 'inset'}
        {@const insetContentBox = {
          left: numericMargins.left,
          top: numericMargins.top,
          width: Math.max(0, width - numericMargins.left - numericMargins.right),
          height: Math.max(0, height - numericMargins.top - numericMargins.bottom),
        }}
        <InsetMarker
          marker={marker as GeoInsetMarkerConfig<TProps>}
          features={allFeatures}
          width={insetContentBox.width}
          height={insetContentBox.height}
          left={insetContentBox.left}
          top={insetContentBox.top}
          defaultFill={cfg.palette[0]}
        />
      {/if}
{/snippet}

<!--
  `x`/`y`: pins the plot's generic linear x/y scales to the full lon/lat
  range. Every geo-aware mark (Geo, Dot, Vector, Link, …) bypasses these
  entirely when a projection is active, routing through it instead — except
  svelteplot's own `Contour` mark, whose scatter/sampler-mode grid is
  hardcoded to read `plot.scales.x`/`y` (see `Contour.svelte`) regardless of
  any active projection. Left unset, that scale would auto-fit to just the
  contour data's own point extent — a different frame than the projection's
  own (typically whole-world) fit, so the contour would sit at the wrong
  scale/position relative to the map under it. Pinning both to the world
  range only helps `contour` markers align (best exactly under an
  `equirectangular` projection, whose x/y truly are linear in lon/lat) and
  is a no-op for every other mark type.
-->
<BasePlotLayout
  {width}
  {height}
  data={hoverCandidates}
  getX={hoverGetX}
  getY={hoverGetY}
  {hover}
  x={{ domain: [-180, 180] }}
  y={{ domain: [90, -90] }}
  projection={finalProjection}
  {margins}
  marginEstimate={GEO_MARGIN_ESTIMATE}
  touchAction={zoomEnabled ? 'none' : undefined}
  bind:containerEl
>
  {#snippet children({ matchedPoints, numericMargins, setHoverMatch, clearHoverMatch })}
    {@const onFeaturePointerEnter = (e: Event, d: TaggedFeature) => {
      if (isOverInset(e as PointerEvent)) return;
      const hp = hoverPointById.get(d.__id);
      if (hp) setHoverMatch([hp.row]);
    }}
    {@const onFeaturePointerLeave = (e: Event) => {
      if (isOverInset(e as PointerEvent)) return;
      clearHoverMatch();
    }}
    <GeoLayout
      {width}
      {height}
      {numericMargins}
      zoomTransform={geoZoom.transform}
      tileLayer={styles.tileLayer}
      {dataLonLatBounds}
    >
      {#each markers as marker, i (marker.type + '-' + i)}
        {#if isBehindMarker(marker)}
          {@render marker_(marker, numericMargins)}
        {/if}
      {/each}

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
          onpointerenter={hoverActive ? onFeaturePointerEnter : undefined}
          onpointerleave={hoverActive ? onFeaturePointerLeave : undefined}
        />
      {/each}

      {#each markers as marker, i (marker.type + '-' + i)}
        {#if !isBehindMarker(marker)}
          {@render marker_(marker, numericMargins)}
        {/if}
      {/each}
    </GeoLayout>

    {#if hoverMarkerConfig}
      <HoverMarker marker={hoverMarkerConfig} data={matchedPoints} />
    {/if}
  {/snippet}
</BasePlotLayout>
