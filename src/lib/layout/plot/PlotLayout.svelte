<script lang="ts" generics="TData extends Record<string, unknown>">
  import type { ComponentProps, Snippet } from 'svelte';
  import { Plot, Pointer, RuleX, RuleY, AxisX, AxisY } from 'svelteplot';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { getHover, createHover } from '$lib/layout/tooltip/hover.svelte';
  import { createHoverController } from '$lib/layout/tooltip/controller.svelte';
  import { hasHoverMarker, findHoverMarker } from '$lib/layout/tooltip/utils';
  import HoverMarker from '$lib/plots/markers/HoverMarker.svelte';
  import Tooltip from '$lib/layout/tooltip/Tooltip.svelte';
  import type { AxisValue, Series, ScalesConfig, MarginConfig } from '$lib/types/plots/common';
  import type { Marker } from '$lib/types/plots/markers';
  import type { HoverStrategy, HoverDisplayPoint, HoverPoint, TooltipRuntime } from '$lib/types/layout/tooltip';

  type SveltePlotProps = ComponentProps<typeof Plot>;

  /**
   * Shared chrome around every plot kind's svelteplot markup: the pointer-event
   * wrapper, the hover/tooltip state machine, the `<Plot>` element itself plus
   * standalone markers (`ruleX`/`ruleY`/un-scoped `component`) and the floating
   * tooltip. A plot kind only supplies its data/accessors and its marks
   * (`<Line>`/`<BarY>`/`<Cell>`, …) through `children`.
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
    seriesData = [],
    showHoverLabels = true,
    scales,
    margins,
    defaultStrategy = 'x',
    children,
  }: {
    width: number;
    height: number;
    x?: SveltePlotProps['x'];
    y?: SveltePlotProps['y'];
    /** Flat rows fed to svelteplot's `<Pointer>` for nearest-point matching. */
    data: TData[];
    getX: (d: TData) => AxisValue;
    getY: (d: TData) => AxisValue;
    /** Pointer's `y` channel — only needed when matching must be 2D (e.g. a heatmap grid). */
    matchY?: (d: TData) => AxisValue;
    hoverPoints: HoverPoint<TData>[];
    label: (row: TData) => string;
    tooltip?: TooltipRuntime<TData>;
    markers?: Marker[];
    /** All resolved series, forwarded to unscoped component markers (e.g. DeltaMarker). */
    seriesData?: Series<TData>[];
    /** Scale config forwarded from the plot. */
    scales?: ScalesConfig;
    /** Partial margin override — merged on top of the theme before tickRotate adjustment. */
    margins?: MarginConfig;
    showHoverLabels?: boolean;
    /**
     * The plot kind's default hover strategy when none is set on the tooltip or
     * hover marker. Line/bar → `'x'`, pyramid → `'y'`, heatmap → `'punctual'`.
     */
    defaultStrategy?: HoverStrategy;
    /**
     * `matchedPoints` carries only display info (+ `series`), not `row` — a
     * per-series-scoped `HoverMarker` never needs the source row, just enough
     * to filter and place dots/labels, which sidesteps forcing a concrete
     * `TData` resolution through this snippet's type for every plot kind.
     * `impliesRuleX`/`impliesRuleY` tell the plot kind whether the active
     * strategy implies a crosshair rule on each axis by default.
     */
    children: Snippet<
      [{
        matchedPoints: HoverDisplayPoint[];
        ruleX: AxisValue | null;
        ruleY: AxisValue | null;
        impliesRuleX: boolean;
        impliesRuleY: boolean;
      }]
    >;
  } = $props();

  const cfg = $derived(getConfiguration());

  const computedMargins = $derived.by(() => {
    const base = { ...cfg.margins, ...margins };
    const xRotate = scales?.x?.tickRotate;
    if (!xRotate) return base;
    const rad = Math.abs(xRotate) * Math.PI / 180;
    return {
      ...base,
      bottom: base.bottom + Math.ceil(Math.sin(rad) * 20),
    };
  });

  // ── Hover / tooltip ───────────────────────────────────────────────────────
  const hoverActive = $derived(tooltip != null || hasHoverMarker(markers));

  const sharedHover = getHover();
  const localHover = createHover();
  const hover = $derived(sharedHover ?? localHover);

  $effect(() => {
    if (sharedHover) return;
    const hoverMarker = findHoverMarker(markers);
    localHover.strategy = tooltip?.strategy ?? hoverMarker?.strategy ?? defaultStrategy;
    localHover.sync = tooltip?.sync ?? hoverMarker?.sync ?? false;
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
    (ctrl.impliesRuleX || unscopedHoverMarker.ruleX === true),
  );
  const showRuleY = $derived(
    unscopedHoverMarker != null &&
    unscopedHoverMarker.ruleY !== false &&
    (ctrl.impliesRuleY || unscopedHoverMarker.ruleY === true),
  );
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="dct-plot"
  style:color={cfg.axis.color}
  onpointermove={hoverActive ? ctrl.onMove : undefined}
  onpointerleave={hoverActive ? ctrl.onLeave : undefined}
>
  <Plot {width} {height} margin={computedMargins} {x} {y}>
    <AxisX tickSize={scales?.x?.tickSize ?? cfg.axis.xTickSize} tickPadding={scales?.x?.tickPadding ?? cfg.axis.xTickPadding} tickFontSize={cfg.axis.fontSize} titleFontSize={scales?.x?.titleFontSize ?? cfg.axis.titleFontSize} />
    <AxisY tickSize={scales?.y?.tickSize ?? cfg.axis.yTickSize} tickPadding={scales?.y?.tickPadding ?? cfg.axis.yTickPadding} tickFontSize={cfg.axis.fontSize} titleFontSize={scales?.y?.titleFontSize ?? cfg.axis.titleFontSize} />
    {@render children({
      matchedPoints: ctrl.points,
      ruleX: ctrl.ruleX,
      ruleY: ctrl.ruleY,
      impliesRuleX: ctrl.impliesRuleX,
      impliesRuleY: ctrl.impliesRuleY,
    })}

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

    {#if hoverActive}
      <Pointer {data} x={getX} y={matchY} maxDistance={400} onupdate={ctrl.onPointer} />
    {/if}

    {#if unscopedHoverMarker}
      <HoverMarker
        data={ctrl.points}
        ruleX={showRuleX ? ctrl.ruleX : null}
        ruleY={showRuleY ? ctrl.ruleY : null}
        showLabels={unscopedHoverMarker.showLabels ?? showHoverLabels}
        format={unscopedHoverMarker.format}
        ruleStyle={unscopedHoverMarker.ruleStyle}
        dotStyle={unscopedHoverMarker.dotStyle}
        fontStyle={unscopedHoverMarker.fontStyle}
      />
    {/if}
  </Plot>

  {#if tooltip && ctrl.showTooltip && ctrl.tooltipPosition}
    <Tooltip x={ctrl.tooltipPosition?.x ?? 0} y={ctrl.tooltipPosition?.y ?? 0}>
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
