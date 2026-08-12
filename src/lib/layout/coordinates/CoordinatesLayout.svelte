<script lang="ts" generics="TData extends Record<string, unknown>">
  import type { ComponentProps, Snippet } from 'svelte';
  import { Plot } from 'svelteplot';
  import { resolveProjection } from '$lib/layout/coordinates/resolveProjection';
  import { createGeoZoom } from '$lib/layout/coordinates/zoom.svelte';
  import { createGeoRotate, type GeoRotate } from '$lib/layout/coordinates/rotate.svelte';
  import type { CoordinatesConfig } from '$lib/types/layout/coordinates';

  type SveltePlotProps = ComponentProps<typeof Plot>;

  /**
   * The Coordinates layer, rendered — resolves the active coordinate system
   * (today, only a `d3-geo` projection; svelteplot has no other coordinate
   * abstraction, cartesian is implicit elsewhere) and owns `<Plot>` itself,
   * since `<Plot projection>` must be known before `<Plot>` mounts — nothing
   * nested inside it could supply that prop after the fact. Also owns the
   * pan/zoom/rotate gesture state and applies the resulting transform as a
   * `<g>` wrapper around `children`. A no-op identity transform, no
   * projection, for every plot kind but `GeoPlot`.
   */
  let {
    width,
    height,
    margin,
    x,
    y,
    coordinates = undefined,
    data,
    containerEl,
    children,
  }: {
    width: number;
    height: number;
    margin: SveltePlotProps['margin'];
    x: SveltePlotProps['x'];
    y: SveltePlotProps['y'];
    coordinates?: CoordinatesConfig;
    /** Fed to `resolveProjection`'s `domain: 'data'` sentinel — the same rows `BasePlotLayout` uses for hover matching. */
    data: TData[];
    containerEl?: HTMLDivElement;
    children: Snippet;
  } = $props();

  const resolvedProjection = $derived(
    coordinates?.projection ? resolveProjection(coordinates.projection, data) : undefined,
  );

  const zoomEnabled = $derived(coordinates?.zoom !== false && coordinates?.zoom != null);
  const zoomConfig = $derived(typeof coordinates?.zoom === 'object' ? coordinates.zoom : undefined);

  /**
   * Orthographic (and other azimuthal, hemisphere-style) projections don't
   * gain anything from drag-to-*pan* — panning just slides the same globe a
   * few pixels within the frame — so when zoom is enabled on one, drag
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
</script>

<Plot {width} {height} {margin} {x} {y} projection={finalProjection as SveltePlotProps['projection']}>
  <g transform="translate({geoZoom.transform.x}, {geoZoom.transform.y}) scale({geoZoom.transform.k})">
    {@render children()}
  </g>
</Plot>
