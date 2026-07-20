<script lang="ts" generics="TProps extends Record<string, unknown>">
  import { geoPath } from 'd3-geo';
  import { buildInsetProjection } from './insetProjection';
  import { insetBox } from './insetLayout';
  import { filterGeometryParts } from '$lib/plots/utils/geoAccessors';
  import TooltipLayout from '$lib/layout/tooltip/TooltipLayout.svelte';
  import type { GeoInsetMarker } from '$lib/types/markers/geo';
  import type { GeoFeature } from '$lib/types/plots/data/geo';

  /**
   * A small, independently-projected map panel anchored to a corner/edge of
   * the plot — see `GeoInsetMarker`'s doc comment. Renders raw `<path>`s via
   * its own `d3-geo` `geoPath`, deliberately not svelteplot's `<Geo>` mark:
   * that mark is bound to the plot's *shared* projection scale, but an inset
   * needs its own, independently fit to just what it's showing.
   */
  let {
    marker,
    features,
    width,
    height,
    left = 0,
    top = 0,
    defaultFill,
  }: {
    marker: GeoInsetMarker<TProps>;
    /**
     * The plot's own already-tagged features (`__id` set), with full,
     * unreduced geometry regardless of the plot's own `excludeParts` — used
     * when `marker.data` is omitted, so an inset can show a part the main
     * map excludes without needing a separate dataset.
     */
    features: (GeoFeature<TProps> & { __id: string })[];
    /**
     * The plot's own *content* width/height — i.e. already net of margins,
     * matching the frame the map itself is actually drawn into (svelteplot
     * bakes margins into the projection's scale/translate rather than
     * wrapping marks in a translating `<g>`, so this needs to match, not the
     * plot's raw outer width/height) — `location`'s edge and `margin`'s gap
     * are both measured against this box, not the full canvas.
     */
    width: number;
    height: number;
    /** Top-left corner of that content box, in the plot's own absolute coordinate space (i.e. its margins). */
    left?: number;
    top?: number;
    defaultFill: string;
  } = $props();

  const insetFeatures = $derived.by((): GeoFeature<Record<string, unknown>>[] => {
    if (marker.data) {
      return (
        Array.isArray(marker.data) ? marker.data : marker.data.features
      ) as GeoFeature<Record<string, unknown>>[];
    }
    if (marker.features?.length) {
      const wanted = new Set(marker.features);
      const matched = features.filter((f) => wanted.has(f.__id));
      if (!marker.featurePartsFilter) return matched;
      const partsFilter = marker.featurePartsFilter;
      return matched.flatMap((f) => {
        const geometry = filterGeometryParts(f.geometry, (part) => partsFilter(part, f));
        return geometry ? [{ ...f, geometry }] : [];
      });
    }
    return [];
  });

  const box = $derived(
    insetBox(marker.location, marker.width ?? 0.26, marker.height ?? 0.22, marker.margin ?? 8, width, height),
  );

  const path = $derived.by(() => {
    if (insetFeatures.length === 0 || box.width <= 0 || box.height <= 0) return null;
    const projection = buildInsetProjection(marker.projection);
    const collection: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: insetFeatures };
    projection.fitExtent(
      [
        [0, 0],
        [box.width, box.height],
      ],
      collection,
    );
    return geoPath(projection);
  });

  /**
   * Nearest-feature hover, local to this inset only — mirrors the main
   * map's own "always nearest feature centroid" behaviour (see `Plot.svelte`),
   * but computed against this inset's own fitted `path`/projection instead
   * of the plot's shared one, since svelteplot's `<Pointer>` (which drives
   * the main map's hover) only ever matches the main projection's own
   * feature positions — it has no way to reach content an inset draws at a
   * wholly different scale/location.
   */
  const centroids = $derived.by(() => {
    if (!path) return [];
    return insetFeatures.map((f) => ({ feature: f, centroid: path.centroid(f as GeoJSON.Feature) }));
  });

  let hovered = $state<{ feature: GeoFeature<Record<string, unknown>>; x: number; y: number } | null>(null);

  // Any point within the inset box always matches its nearest feature —
  // there's no reason for a hover inside a small, self-contained panel to
  // ever come up empty, so the threshold is just the box's own diagonal.
  const maxDistance = $derived(Math.hypot(box.width, box.height));

  function onInsetPointerMove(e: PointerEvent) {
    const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let nearest: (typeof centroids)[number] | null = null;
    let nearestDist = Infinity;
    for (const c of centroids) {
      const d = Math.hypot(c.centroid[0] - x, c.centroid[1] - y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = c;
      }
    }
    hovered = nearest && nearestDist <= maxDistance ? { feature: nearest.feature, x, y } : null;
  }

  function onInsetPointerLeave() {
    hovered = null;
  }
</script>

{#if path}
  <g class="dct-geo-inset" transform="translate({box.left + left}, {box.top + top})">
    {#each insetFeatures as f, i (i)}
      <path
        d={path(f as GeoJSON.Feature) ?? undefined}
        fill={marker.style?.fill ?? defaultFill}
        fill-opacity={marker.style?.fillOpacity}
        stroke={marker.style?.stroke ?? 'currentColor'}
        stroke-width={marker.style?.strokeWidth ?? 0.5}
        style="vector-effect: non-scaling-stroke"
      />
    {/each}
    {#if marker.tooltip}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <rect
        x={0}
        y={0}
        width={box.width}
        height={box.height}
        fill="transparent"
        onpointermove={onInsetPointerMove}
        onpointerleave={onInsetPointerLeave}
      />
    {/if}
    {#if marker.tooltip}
      {@const tooltip = marker.tooltip}
      <foreignObject x={0} y={0} width={box.width} height={box.height} style="overflow: visible; pointer-events: none;">
        <div xmlns="http://www.w3.org/1999/xhtml" style="position: relative; width: 100%; height: 100%;">
          <TooltipLayout
            visible={hovered != null}
            x={hovered?.x ?? 0}
            y={hovered?.y ?? 0}
            bounds={{ width: box.width, height: box.height }}
            rows={hovered ? [hovered.feature] : []}
            format={tooltip.format}
            content={tooltip.content}
          />
        </div>
      </foreignObject>
    {/if}
  </g>
{/if}
