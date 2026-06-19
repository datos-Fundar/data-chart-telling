<script lang="ts" generics="TData extends Record<string, unknown>">
  import type { ComponentProps, Snippet } from 'svelte';
  import { Plot, Pointer, RuleX, RuleY } from 'svelteplot';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { getHover, createHover } from '$lib/layout/tooltip/hover.svelte';
  import { createHoverController } from '$lib/layout/tooltip/controller.svelte';
  import HoverMarker from '$lib/plots/markers/HoverMarker.svelte';
  import Tooltip from '$lib/layout/tooltip/Tooltip.svelte';
  import type { XValue } from '$lib/types/plots/common';
  import type { HoverPoint, TooltipRuntime } from '$lib/types/layout/tooltip';
  import type { Marker } from '$lib/types/plots/markers';

  type PlotProps = ComponentProps<typeof Plot>;

  /**
   * Shared chrome around every plot kind's svelteplot markup: the pointer-event
   * wrapper, the hover/tooltip state machine, the `<Plot>` element itself plus
   * standalone markers (`ruleX`/`ruleY`/un-scoped `component`) and the floating
   * tooltip. A plot kind only supplies its data/accessors and its marks (axes,
   * `<Line>`/`<BarY>`/`<Cell>`, …) through `children`.
   */
  let {
    width,
    height,
    x,
    y,
    data,
    getX,
    getY,
    matchY,
    hoverPoints,
    label,
    tooltip = undefined,
    markers = [],
    showHoverLabels = true,
    children,
  }: {
    width: number;
    height: number;
    x?: PlotProps['x'];
    y?: PlotProps['y'];
    /** Flat rows fed to svelteplot's `<Pointer>` for nearest-point matching. */
    data: TData[];
    getX: (d: TData) => XValue;
    getY: (d: TData) => XValue | number;
    /** Pointer's `y` channel — only needed when matching must be 2D (e.g. a heatmap grid). */
    matchY?: (d: TData) => XValue;
    hoverPoints: HoverPoint<TData>[];
    label: (row: TData) => string;
    tooltip?: TooltipRuntime<TData>;
    /** Standalone markers (`ruleX`, `ruleY`, un-scoped `component`); per-series markers stay with the plot kind. */
    markers?: Marker[];
    showHoverLabels?: boolean;
    children: Snippet;
  } = $props();

  const cfg = $derived(getConfiguration());

  // ── Hover / tooltip ───────────────────────────────────────────────────────
  const sharedHover = getHover();
  const localHover = createHover();
  const hover = $derived(sharedHover ?? localHover);
  $effect(() => {
    if (!sharedHover && tooltip) localHover.sync = tooltip.sync;
  });

  const ctrl = createHoverController<TData>({
    hover: () => hover,
    facetId: () => tooltip?.facetId ?? '',
    points: () => hoverPoints,
    getX: () => getX,
    getY: () => getY,
    label: () => label,
    format: () => tooltip?.format ?? label,
  });

  const topLevelMarkers = $derived(
    markers.filter(
      (marker) =>
        marker.type === 'ruleX' ||
        marker.type === 'ruleY' ||
        (marker.type === 'component' && !marker.series),
    ),
  );
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="dct-plot"
  style:color={cfg.axis.color}
  onpointermove={tooltip ? ctrl.onMove : undefined}
  onpointerleave={tooltip ? ctrl.onLeave : undefined}
>
  <Plot {width} {height} margin={cfg.margins} {x} {y}>
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
        <marker.component {...marker.props} data={marker.data} />
      {/if}
    {/each}

    {#if tooltip}
      <Pointer {data} x={getX} y={matchY} maxDistance={400} onupdate={ctrl.onPointer} />
      <HoverMarker
        data={ctrl.points}
        ruleX={ctrl.ruleX}
        ruleY={ctrl.ruleY}
        color={cfg.timeline.activeColor}
        showLabels={showHoverLabels}
      />
    {/if}
  </Plot>

  {#if tooltip && ctrl.showTooltip && ctrl.cursor}
    <Tooltip x={ctrl.cursor.x} y={ctrl.cursor.y}>{ctrl.tooltipText}</Tooltip>
  {/if}
</div>

<style>
  .dct-plot {
    position: relative;
    line-height: 0;
  }
</style>
