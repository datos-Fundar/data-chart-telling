<script lang="ts" generics="TData extends Record<string, unknown>">
  import type { Snippet } from 'svelte';
  import { RuleX, RuleY } from 'svelteplot';
  import HoverMarker from '$lib/markers/HoverMarker.svelte';
  import type { AxisValue } from '$lib/types/plots/axis';
  import type { Series } from '$lib/types/plots/data/common';
  import type { Marker } from '$lib/types/markers/common';
  import type { HoverPoint } from '$lib/types/layout/tooltip';

  /**
   * Standalone rule markers (`ruleX`/`ruleY`/un-scoped `component`) plus the
   * unscoped hover crosshair+dot+label — the plot kinds with an x/y axis pair
   * only (line/bar/heatmap/pyramid); `GeoPlot` has no rule/crosshair concept
   * of its own. Wraps `children` (the plot kind's actual marks) so both draw
   * in the same order as before this was split out of `BasePlotLayout`: marks
   * first, then rules/hover marker on top of them.
   */
  let {
    markers = [],
    seriesData = [],
    matchedPoints,
    ruleX,
    ruleY,
    impliesRuleX,
    impliesRuleY,
    showHoverLabels = true,
    children,
  }: {
    markers?: Marker[];
    /** All resolved series, forwarded to unscoped component markers (e.g. DeltaMarker). */
    seriesData?: Series<TData>[];
    matchedPoints: HoverPoint<TData>[];
    ruleX: AxisValue | null;
    ruleY: AxisValue | null;
    impliesRuleX: boolean;
    impliesRuleY: boolean;
    showHoverLabels?: boolean;
    children: Snippet;
  } = $props();

  const topLevelMarkers = $derived(
    markers.filter(
      (marker) =>
        marker.type === 'ruleX' ||
        marker.type === 'ruleY' ||
        (marker.type === 'component' && !marker.series),
    ),
  );

  /** The unscoped (no `series`) hover marker, if any. */
  const unscopedHoverMarker = $derived(
    markers.find((m) => m.type === 'hover' && !m.series) as
      | Extract<Marker, { type: 'hover' }>
      | undefined,
  );

  /**
   * Gate ruleX display: shows when the strategy implies it (default) or the
   * marker explicitly requests it (`ruleX: true`), and is never suppressed
   * unless the marker explicitly disables it (`ruleX: false`).
   */
  const showRuleX = $derived(
    unscopedHoverMarker != null &&
    unscopedHoverMarker.ruleX !== false &&
    (impliesRuleX || unscopedHoverMarker.ruleX === true),
  );
  const showRuleY = $derived(
    unscopedHoverMarker != null &&
    unscopedHoverMarker.ruleY !== false &&
    (impliesRuleY || unscopedHoverMarker.ruleY === true),
  );
</script>

{@render children()}

{#each topLevelMarkers as marker, i (marker.type === 'ruleX' ? `${marker.type}-${marker.x}` : marker.type === 'ruleY' ? `${marker.type}-${marker.y}` : `${marker.type}-${i}`)}
  {#if marker.type === 'ruleX'}
    <RuleX
      data={[{ xValue: marker.x }]}
      x={(d) => d.xValue}
      stroke={marker.style?.stroke ?? 'currentColor'}
      strokeWidth={marker.style?.strokeWidth ?? 1}
      strokeOpacity={marker.style?.strokeOpacity ?? 1}
      strokeDasharray={marker.style?.strokeDasharray}
    />
  {:else if marker.type === 'ruleY'}
    <RuleY
      data={[{ yValue: marker.y }]}
      y={(d) => d.yValue}
      stroke={marker.style?.stroke ?? 'currentColor'}
      strokeWidth={marker.style?.strokeWidth ?? 1}
      strokeOpacity={marker.style?.strokeOpacity ?? 1}
      strokeDasharray={marker.style?.strokeDasharray}
    />
  {:else if marker.type === 'component'}
    <marker.component {...marker.props} data={marker.data ?? seriesData} />
  {/if}
{/each}

{#if unscopedHoverMarker}
  <HoverMarker
    data={matchedPoints}
    ruleX={showRuleX ? ruleX : null}
    ruleY={showRuleY ? ruleY : null}
    showLabels={unscopedHoverMarker.showLabels ?? showHoverLabels}
    format={unscopedHoverMarker.format}
    ruleStyle={unscopedHoverMarker.ruleStyle}
    dotStyle={unscopedHoverMarker.dotStyle}
    fontStyle={unscopedHoverMarker.fontStyle}
  />
{/if}
