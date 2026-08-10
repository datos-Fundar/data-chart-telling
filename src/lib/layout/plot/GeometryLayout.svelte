<script lang="ts" generics="TData extends Record<string, unknown>">
  import type { Snippet } from 'svelte';
  import BarMarker from '$lib/markers/BarMarker.svelte';
  import RuleMarker from '$lib/markers/RuleMarker.svelte';
  import HoverMarker from '$lib/markers/HoverMarker.svelte';
  import type { Series } from '$lib/types/plots/data/common';
  import type { Marker } from '$lib/types/markers/common';
  import type { HoverPoint } from '$lib/types/layout/tooltip';

  /**
   * Renders every *unscoped* marker in `markers`, in array order — one flat
   * list of "geometries," each delegated to the one component that already
   * knows how to draw itself (`BarMarker`/`HoverMarker`, or a `'component'`
   * marker's own `marker.component`) — `'rule'` markers go straight to the
   * shared `RuleMarker` primitive with their own `axis`, since it's a
   * one-line delegation to it and doesn't warrant its own wrapper component
   * for a single call site. This layout owns none of
   * the "how a marker looks" logic — only routing, plus the couple of props
   * a marker kind needs beyond its own config (live hover-controller state,
   * for `hover`).
   *
   * Order is entirely the caller's responsibility: each `Plot.svelte` is
   * expected to build its own `markers` array as `[...its own default
   * marks (e.g. BarPlot's bars), ...the author's own markers prop, in the
   * order given]`. `children` (a plot kind's value labels + scoped
   * markers) renders last, on top of everything in this list.
   *
   * Markers scoped to one `series` (`hover`/`component`) are excluded here
   * — each plot kind still renders those itself, inline per series/segment
   * (inside `children`), since that needs per-series `matchedPoints`
   * filtering this layout has no concept of.
   */
  let {
    markers = [],
    seriesData = [],
    matchedPoints,
    activePoint,
    impliesCrosshairX,
    impliesCrosshairY,
    children,
  }: {
    markers?: Marker[];
    /** All resolved series, forwarded to unscoped component markers (e.g. DeltaMarker). */
    seriesData?: Series<TData>[];
    matchedPoints: HoverPoint<TData>[];
    /** The specific matched point actually under the cursor — see `controller.svelte.ts`'s own doc comment. */
    activePoint: HoverPoint<TData> | null;
    impliesCrosshairX: boolean;
    impliesCrosshairY: boolean;
    children: Snippet;
  } = $props();

  const geometryMarkers = $derived(
    markers.filter((marker) => !((marker.type === 'hover' || marker.type === 'component') && marker.series)),
  );

  function markerKey(marker: Marker, i: number): string {
    if (marker.type === 'rule') return `rule-${marker.axis}-${marker.value}`;
    if (marker.type === 'bar') return `bar-${marker.role}-${i}`;
    return `${marker.type}-${i}`;
  }
</script>

{#each geometryMarkers as marker, i (markerKey(marker, i))}
  {#if marker.type === 'bar'}
    <BarMarker {marker} />
  {:else if marker.type === 'rule'}
    <RuleMarker axis={marker.axis} value={marker.value} style={marker.style} />
  {:else if marker.type === 'component'}
    <marker.component {...marker.props} data={marker.data ?? seriesData} />
  {:else if marker.type === 'hover'}
    <HoverMarker {marker} data={matchedPoints} {activePoint} {impliesCrosshairX} {impliesCrosshairY} />
  {/if}
{/each}

{@render children()}
