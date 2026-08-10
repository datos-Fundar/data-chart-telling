<script lang="ts" generics="TData extends Record<string, unknown>">
  import type { Snippet } from 'svelte';
  import { RuleX, RuleY, BarX, BarY, usePlot } from 'svelteplot';
  import HoverMarker from '$lib/markers/HoverMarker.svelte';
  import type { AxisValue } from '$lib/types/plots/axis';
  import type { Series } from '$lib/types/plots/data/common';
  import type { Marker, BarMarkerConfig } from '$lib/types/markers/common';
  import type { HoverPoint } from '$lib/types/layout/tooltip';

  /**
   * Standalone rule markers (`ruleX`/`ruleY`/un-scoped `component`), `'bar'`
   * markers (`BarPlot`'s own bars/segments and their invisible hover hit
   * areas — see `buildBarMarkers`), plus the unscoped hover crosshair+dot+
   * label — the plot kinds with an x/y axis pair only (line/bar/heatmap/
   * pyramid); `GeoPlot` has no rule/crosshair concept of its own.
   *
   * `'bar'` markers render *before* `children` (bars are the base marks —
   * `ValueLabels`/scoped markers inside `children` rely on painting on top
   * of them), while everything else keeps rendering after `children`, same
   * as before this was split out of `BasePlotLayout`.
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

  const barMarkers = $derived(
    markers.filter((marker): marker is BarMarkerConfig => marker.type === 'bar'),
  );

  /**
   * Only `'hitArea'` bar markers need this — resolving their category into
   * pixels requires the live band scale, which (unlike a `'segment'`
   * marker's already-baked data-value accessors) can't be precomputed by
   * `buildBarMarkers` outside the `<Plot>` tree.
   */
  const plot = usePlot();
  function categoryScaleFor(isHorizontal: boolean) {
    return isHorizontal ? plot.scales.y : plot.scales.x;
  }
  function valueScaleFor(isHorizontal: boolean) {
    return isHorizontal ? plot.scales.x : plot.scales.y;
  }
  function valueExtentFor(isHorizontal: boolean): [number, number] {
    const range = valueScaleFor(isHorizontal)?.fn?.range?.();
    if (!range || range.length < 2) return [0, 0];
    const a = Number(range[0]);
    const b = Number(range[range.length - 1]);
    return [Math.min(a, b), Math.max(a, b)];
  }

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

{#each barMarkers as marker, i (`bar-${marker.role}-${i}`)}
  {#if marker.role === 'segment'}
    {#if marker.isHorizontal}
      <BarX
        data={marker.data}
        y={marker.y}
        x1={marker.x1}
        x2={marker.x2}
        insetTop={marker.insetTop}
        insetBottom={marker.insetBottom}
        fill={marker.style?.fill}
        fillOpacity={marker.style?.fillOpacity}
        stroke={marker.style?.stroke}
        strokeWidth={marker.style?.strokeWidth}
        strokeOpacity={marker.style?.strokeOpacity}
        strokeDasharray={marker.style?.strokeDasharray}
        borderRadius={marker.style?.borderRadius}
      />
    {:else}
      <BarY
        data={marker.data}
        x={marker.x}
        y1={marker.y1}
        y2={marker.y2}
        insetLeft={marker.insetLeft}
        insetRight={marker.insetRight}
        fill={marker.style?.fill}
        fillOpacity={marker.style?.fillOpacity}
        stroke={marker.style?.stroke}
        strokeWidth={marker.style?.strokeWidth}
        strokeOpacity={marker.style?.strokeOpacity}
        strokeDasharray={marker.style?.strokeDasharray}
        borderRadius={marker.style?.borderRadius}
      />
    {/if}
  {:else}
    {@const categoryScale = categoryScaleFor(marker.isHorizontal)}
    {#if categoryScale?.type === 'band'}
      {@const bandwidth = categoryScale.fn.bandwidth()}
      {@const bandStart = Number(categoryScale.fn(marker.category as never) ?? 0)}
      {@const [valueMin, valueMax] = valueExtentFor(marker.isHorizontal)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      {#if marker.isHorizontal}
        <rect
          x={valueMin}
          y={bandStart}
          width={Math.max(0, valueMax - valueMin)}
          height={bandwidth}
          fill="transparent"
          onpointerenter={marker.onpointerenter}
          onpointerleave={marker.onpointerleave}
        />
      {:else}
        <rect
          x={bandStart}
          y={valueMin}
          width={bandwidth}
          height={Math.max(0, valueMax - valueMin)}
          fill="transparent"
          onpointerenter={marker.onpointerenter}
          onpointerleave={marker.onpointerleave}
        />
      {/if}
    {/if}
  {/if}
{/each}

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
