<script lang="ts">
  import { geoPath, type GeoPath } from 'd3-geo';
  import { usePlot } from 'svelteplot';
  import type { Snippet } from 'svelte';
  import type { GeoFeature } from '$lib/types/plots/geo/common';

  /**
   * Masks a `contour` marker to just the landmass (`'land'`) or just the
   * water (`'ocean'`) of the plot's own base map, via an SVG `clipPath` —
   * lets a filled contour read as "temperature over land" without also
   * painting straight across the ocean, or vice versa. A no-op passthrough
   * when `mode` is unset, so this can unconditionally wrap every `contour`
   * marker without an extra branch at each call site.
   *
   * Builds the clip path from the plot's own shared, already-fitted
   * projection (`usePlot()` — the same hook `TileLayer.svelte` uses) rather
   * than an independent one, so it lines up with the rest of the map
   * regardless of projection/zoom. `'ocean'` unions the sphere and land
   * paths into one `clip-rule: evenodd` shape — the sphere covers
   * everything, then every land ring toggles back out, leaving only water.
   */
  let {
    mode,
    features,
    children,
  }: {
    mode: 'land' | 'ocean' | undefined;
    features: GeoFeature<Record<string, unknown>>[];
    children: Snippet;
  } = $props();

  const plot = usePlot();
  const clipId = `geo-contour-clip-${Math.random().toString(36).slice(2, 9)}`;

  // Same runtime shape TileLayer.svelte relies on — svelteplot's own
  // `PlotScale` type doesn't reflect it, but `plot.scales.projection` is a
  // real `d3-geo`-compatible stream source at runtime.
  const path: GeoPath = $derived(geoPath(plot.scales.projection as unknown as Parameters<typeof geoPath>[0]));
  // Some real-world datasets carry exact-duplicate features for the same
  // territory (seen in this repo's own `WORLD_COUNTRIES` fixture, for every
  // South American country) — harmless for an ordinary filled `<Geo>` (the
  // duplicate just redraws the same shape), but fatal here: two identical,
  // oppositely-would-be-redundant copies of the same ring toggle each other
  // back out under `clip-rule: evenodd`, silently punching a hole exactly
  // where the duplicated territory is. Deduping by geometry keeps this
  // correct regardless of whether the caller's data happens to be clean.
  const uniqueGeometries = $derived(
    Array.from(new Map(features.map((f) => [JSON.stringify(f.geometry), f as unknown as GeoJSON.Feature])).values()),
  );
  const landPath = $derived(
    uniqueGeometries
      .map((f) => path(f))
      .filter((d): d is string => !!d)
      .join(' '),
  );
  // `{type: 'Sphere'}` is d3-geo's own pseudo-geometry for "the whole
  // globe" — not part of the GeoJSON spec, so `@types/geojson` has no type
  // for it either.
  const spherePath = $derived(path({ type: 'Sphere' } as unknown as GeoJSON.Feature) ?? '');
</script>

{#if mode}
  <defs>
    <clipPath id={clipId}>
      {#if mode === 'land'}
        <path d={landPath} clip-rule="evenodd" />
      {:else}
        <path d="{spherePath} {landPath}" clip-rule="evenodd" />
      {/if}
    </clipPath>
  </defs>
  <g clip-path="url(#{clipId})">
    {@render children()}
  </g>
{:else}
  {@render children()}
{/if}
