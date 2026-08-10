<script lang="ts" generics="TData extends Record<string, unknown>">
  import type { Snippet } from 'svelte';
  import BarMarker from '$lib/markers/BarMarker.svelte';
  import LineMarker from '$lib/markers/LineMarker.svelte';
  import CellMarker from '$lib/markers/CellMarker.svelte';
  import DotMarker from '$lib/markers/DotMarker.svelte';
  import RuleMarker from '$lib/markers/RuleMarker.svelte';
  import HoverMarker from '$lib/markers/HoverMarker.svelte';
  import type { Series } from '$lib/types/plots/data/common';
  import type { Marker } from '$lib/types/markers/common';
  import type { HoverPoint } from '$lib/types/layout/tooltip';

  /**
   * Renders every *unscoped* marker in `markers`, in array order, each
   * delegated to the component that knows how to draw it. This layout owns
   * only routing, plus the few extra props a marker kind needs beyond its
   * own config (live hover-controller state, for `hover`).
   *
   * Order is the caller's responsibility: each `Plot.svelte` builds its own
   * `markers` array as its default marks followed by the author's own
   * `markers` prop. `children` (value labels + scoped markers) renders
   * last, on top of everything here.
   *
   * Markers scoped to one `series` (`hover`/`component`) are excluded —
   * each plot kind renders those itself, inline per series/segment, since
   * that needs per-series `matchedPoints` filtering this layout has no
   * concept of.
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
  {:else if marker.type === 'line'}
    <LineMarker {marker} />
  {:else if marker.type === 'cell'}
    <CellMarker {marker} />
  {:else if marker.type === 'dot'}
    <DotMarker data={marker.data} x={marker.x} y={marker.y} style={marker.style} />
  {:else if marker.type === 'rule'}
    <RuleMarker axis={marker.axis} value={marker.value} style={marker.style} />
  {:else if marker.type === 'component'}
    <marker.component {...marker.props} data={marker.data ?? seriesData} />
  {:else if marker.type === 'hover'}
    <HoverMarker {marker} data={matchedPoints} {activePoint} {impliesCrosshairX} {impliesCrosshairY} />
  {/if}
{/each}

{@render children()}
