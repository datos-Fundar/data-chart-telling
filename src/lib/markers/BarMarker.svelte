<script lang="ts">
  import { BarX, BarY, usePlot } from 'svelteplot';
  import type { BarMarkerConfig } from '$lib/types/markers/common';

  /**
   * Renders one `'bar'` marker — `role: 'segment'` is a visible bar/segment
   * (`<BarX>`/`<BarY>`, per `marker.isHorizontal`); `role: 'hitArea'` is an
   * invisible, full-value-axis-extent hit region for one category, whose
   * pixel geometry needs the live band/value scale — only available via
   * `usePlot()` here, where the marker actually renders (not where
   * `buildBarMarkers` builds the marker list).
   */
  let { marker }: { marker: BarMarkerConfig } = $props();

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
</script>

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
