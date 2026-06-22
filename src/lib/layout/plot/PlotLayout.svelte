<script lang="ts" generics="TData extends Record<string, unknown>">
  import type { ComponentProps, Snippet } from 'svelte';
  import { Plot, Pointer, RuleX, RuleY } from 'svelteplot';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { getHover, createHover } from '$lib/layout/tooltip/hover.svelte';
  import { createHoverController } from '$lib/layout/tooltip/controller.svelte';
  import { hasHoverMarker, findHoverMarker } from '$lib/layout/tooltip/utils';
  import HoverMarker from '$lib/plots/markers/HoverMarker.svelte';
  import Tooltip from '$lib/layout/tooltip/Tooltip.svelte';
  import type { XValue } from '$lib/types/plots/common';
  import type { HoverDisplayPoint, HoverPoint, TooltipRuntime } from '$lib/types/layout/tooltip';
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
    /** Standalone markers (`ruleX`, `ruleY`, un-scoped `component`/`hover`); per-series-scoped markers stay with the plot kind. */
    markers?: Marker[];
    showHoverLabels?: boolean;
    /**
     * `matchedPoints` carries only display info (+ `series`), not `row` — a
     * per-series-scoped `HoverMarker` never needs the source row, just enough
     * to filter and place dots/labels, which sidesteps forcing a concrete
     * `TData` resolution through this snippet's type for every plot kind.
     */
    children: Snippet<
      [{ matchedPoints: HoverDisplayPoint[]; ruleX: XValue | null; ruleY: XValue | number | null }]
    >;
  } = $props();

  const cfg = $derived(getConfiguration());

  // ── Hover / tooltip ───────────────────────────────────────────────────────
  // A hover marker activates pointer tracking just like a tooltip does — the
  // two are independent, but both ride the same Pointer/controller plumbing.
  const hoverActive = $derived(tooltip != null || hasHoverMarker(markers));

  const sharedHover = getHover();
  const localHover = createHover();
  const hover = $derived(sharedHover ?? localHover);
  $effect(() => {
    if (sharedHover) return;
    if (tooltip) {
      localHover.sync = tooltip.sync;
    } else {
      localHover.sync = findHoverMarker(markers)?.sync ?? 'none';
    }
  });

  const ctrl = createHoverController<TData>({
    hover: () => hover,
    facetId: () => tooltip?.facetId ?? '',
    points: () => hoverPoints,
    getX: () => getX,
    getY: () => getY,
    label: () => label,
    format: () => tooltip?.format ?? label,
    seriesFilter: () => tooltip?.series,
    width: () => width,
    height: () => height,
  });

  const topLevelMarkers = $derived(
    markers.filter(
      (marker) =>
        marker.type === 'ruleX' ||
        marker.type === 'ruleY' ||
        (marker.type === 'component' && !marker.series),
    ),
  );

  /** The unscoped (no `series`) hover marker, if any — rendered here directly;
   *  series/segment-scoped ones are rendered by the plot kind itself, which
   *  has access to its own series grouping. */
  const unscopedHoverMarker = $derived(
    markers.find((m) => m.type === 'hover' && !m.series) as
      | Extract<Marker, { type: 'hover' }>
      | undefined,
  );
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="dct-plot"
  style:color={cfg.axis.color}
  onpointermove={hoverActive ? ctrl.onMove : undefined}
  onpointerleave={hoverActive ? ctrl.onLeave : undefined}
>
  <Plot {width} {height} margin={cfg.margins} {x} {y}>
    {@render children({ matchedPoints: ctrl.points, ruleX: ctrl.ruleX, ruleY: ctrl.ruleY })}

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

    {#if hoverActive}
      <Pointer {data} x={getX} y={matchY} maxDistance={400} onupdate={ctrl.onPointer} />
    {/if}

    {#if unscopedHoverMarker}
      <HoverMarker
        data={ctrl.points}
        ruleX={unscopedHoverMarker.ruleX !== false ? ctrl.ruleX : null}
        ruleY={unscopedHoverMarker.ruleY !== false ? ctrl.ruleY : null}
        color={unscopedHoverMarker.color ?? cfg.timeline.activeColor}
        showLabels={unscopedHoverMarker.showLabels ?? showHoverLabels}
        ruleStyle={unscopedHoverMarker.ruleStyle}
        dotStyle={unscopedHoverMarker.dotStyle}
        fontStyle={unscopedHoverMarker.fontStyle}
      />
    {/if}
  </Plot>

  {#if tooltip && ctrl.showTooltip && ctrl.tooltipPosition}
    <!-- `tooltipPosition` is the real cursor in the facet the mouse is
         physically over; every other facet broadcasting a synced match
         reprojects that cursor's relative position onto its own box. -->
    <Tooltip x={ctrl.tooltipPosition.x} y={ctrl.tooltipPosition.y}>
      {#if tooltip.content}
        {@render tooltip.content({ rows: ctrl.matchedRows.map((p) => p.row) })}
      {:else}
        {ctrl.tooltipText}
      {/if}
    </Tooltip>
  {/if}
</div>

<style>
  .dct-plot {
    position: relative;
    line-height: 0;
  }
</style>
