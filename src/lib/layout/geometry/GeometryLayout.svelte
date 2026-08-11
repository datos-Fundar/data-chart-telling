<script lang="ts" generics="TData extends Record<string, unknown>">
  import type { Snippet } from 'svelte';
  import { SvelteMap } from 'svelte/reactivity';
  import BarMarker from '$lib/markers/BarMarker.svelte';
  import LineMarker from '$lib/markers/LineMarker.svelte';
  import CellMarker from '$lib/markers/CellMarker.svelte';
  import DotMarker from '$lib/markers/DotMarker.svelte';
  import RuleMarker from '$lib/markers/RuleMarker.svelte';
  import HoverMarker from '$lib/markers/HoverMarker.svelte';
  import type { Series } from '$lib/types/plots/data/common';
  import type { Marker } from '$lib/types/markers/common';
  import type { HoverPoint } from '$lib/types/layout/tooltip';
  import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';

  /**
   * Renders every marker in `markers`, in array order, each delegated to the
   * component that knows how to draw it. This layout owns only routing,
   * plus the few extra props a marker kind needs beyond its own config
   * (live hover-controller state, for `hover`; per-series data/color, for a
   * `series`-scoped `hover`/`component`).
   *
   * Order is the caller's responsibility: each `Plot.svelte` builds its own
   * `markers` array as its default marks followed by the author's own
   * `markers` prop. `children` (value labels) renders last, on top of
   * everything here.
   *
   * A marker scoped to one `series` (`hover`/`component` with `.series` set)
   * renders once per matching entry in `scopedGroups` instead of the plain
   * loop above, since it needs that series' own data/color and, for
   * `scope: 'segment'`, its resolved segments — supplied by the caller
   * rather than resolved here, since the segment style shape differs per
   * plot kind.
   */
  let {
    markers = [],
    seriesData = [],
    scopedGroups = [],
    matchedPoints,
    activePoint,
    impliesCrosshairX,
    impliesCrosshairY,
    children,
  }: {
    markers?: Marker[];
    /** All resolved series, forwarded to unscoped component markers (e.g. DeltaMarker). */
    seriesData?: Series<TData>[];
    /** One entry per series that can own a `series`-scoped marker — see this component's own doc. */
    scopedGroups?: ScopedMarkerGroup<TData>[];
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

  const scopedMarkersByName = $derived.by(() => {
    const map = new SvelteMap<string, Marker[]>();
    for (const marker of markers) {
      if ((marker.type === 'hover' || marker.type === 'component') && marker.series) {
        if (!map.has(marker.series)) map.set(marker.series, []);
        map.get(marker.series)!.push(marker);
      }
    }
    return map;
  });

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

{#each scopedGroups as group (group.name)}
  {#each scopedMarkersByName.get(group.name) ?? [] as marker, i (`${group.name}-${marker.type}-${i}`)}
    {#if marker.type === 'hover'}
      {@const seriesPoints = matchedPoints.filter((p) => p.series === group.name)}
      {#if marker.scope === 'segment'}
        {#each group.segments as seg, segIdx (`${group.name}-hover-segment-${segIdx}`)}
          {@const segPoints = seriesPoints.filter((p) => seg.match(p.row))}
          {#if segPoints.length > 0}
            <HoverMarker
              {marker}
              data={segPoints}
              activePoint={segPoints[0] ?? null}
              {impliesCrosshairX}
              {impliesCrosshairY}
              seriesColor={seg.color}
            />
          {/if}
        {/each}
      {:else}
        <HoverMarker
          {marker}
          data={seriesPoints}
          activePoint={seriesPoints[0] ?? null}
          {impliesCrosshairX}
          {impliesCrosshairY}
          seriesColor={group.segments[0]?.color ?? group.color}
        />
      {/if}
    {:else if marker.type === 'component'}
      {#if marker.scope === 'segment'}
        {#each group.segments as seg, segIdx (`${group.name}-component-segment-${segIdx}`)}
          {@const segmentData = group.data.filter((row) => seg.match(row))}
          {#if segmentData.length > 0}
            <marker.component {...marker.props} series={group.name} data={segmentData} seriesColor={seg.color} />
          {/if}
        {/each}
      {:else}
        <marker.component
          {...marker.props}
          series={group.name}
          data={group.data}
          seriesColor={group.segments[0]?.color ?? group.color}
        />
      {/if}
    {/if}
  {/each}
{/each}

{@render children()}
