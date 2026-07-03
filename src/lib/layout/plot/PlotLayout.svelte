<script lang="ts" generics="TData extends Record<string, unknown>">
  import type { ComponentProps, Snippet } from 'svelte';
  import { Plot, Pointer, RuleX, RuleY, AxisX, AxisY } from 'svelteplot';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { getHover, createHover } from '$lib/layout/tooltip/hover.svelte';
  import { createHoverController } from '$lib/layout/tooltip/controller.svelte';
  import { hasHoverMarker, findHoverMarker } from '$lib/layout/tooltip/utils';
  import HoverMarker from '$lib/plots/markers/HoverMarker.svelte';
  import Tooltip from '$lib/layout/tooltip/Tooltip.svelte';
  import type { AxisValue, AxisScale, Series, ScalesConfig, MarginConfig } from '$lib/types/plots/common';
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

  // ── Axis ticks / domain ──────────────────────────────────────────────────

  const xValues = $derived(data.map(getX));
  const yValues = $derived(data.map(getY));

  /**
   * Caps the requested tick count to the axis's own number of distinct
   * values, but never above what the pixel width would naturally request —
   * so a narrow domain (e.g. 5 whole years) never gets subdivided into
   * fractional ticks (2020, 2020.5, 2021, …) just to fill the space. Skipped
   * whenever the caller already controls tick density directly.
   */
  function autoTickCount(scale: AxisScale | undefined, values: AxisValue[], span: number, spacing: number, min: number): number | undefined {
    if (scale?.ticks != null || scale?.tickSpacing != null || scale?.interval != null) return undefined;
    const uniqueCount = new Set(values.map(String)).size;
    const natural = Math.max(min, Math.round(span / spacing));
    return uniqueCount >= 2 && uniqueCount < natural ? uniqueCount : undefined;
  }

  const xTickCount = $derived(
    autoTickCount(scales?.x, xValues, Math.max(0, width - computedMargins.left - computedMargins.right), 80, 3),
  );
  const yTickCount = $derived(
    autoTickCount(scales?.y, yValues, Math.max(0, height - computedMargins.top - computedMargins.bottom), 50, 2),
  );

  /**
   * svelteplot's own `sort` scale option only toggles a fixed ascending sort
   * (lexicographic for strings) — it can't take a custom comparator. When the
   * caller supplies one via `scales.x.sort`/`scales.y.sort` for a string-valued
   * axis (e.g. dates formatted as text), compute the ordered domain ourselves
   * and hand it to the scale as an explicit `domain`, which svelteplot does
   * respect as-is for ordinal scales.
   */
  function sortedScale<T>(scale: T, scaleConfig: AxisScale | undefined, values: AxisValue[]): T {
    const sort = scaleConfig?.sort;
    if (!sort || scaleConfig?.domain || values.length === 0) return scale;
    if (!values.every((v) => typeof v === 'string')) return scale;
    const domain = [...new Set(values)].sort(sort);
    return { ...(scale as object), domain } as T;
  }

  const resolvedX = $derived(sortedScale(x, scales?.x, xValues));
  const resolvedY = $derived(sortedScale(y, scales?.y, yValues));

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
  <Plot {width} {height} margin={computedMargins} x={resolvedX} y={resolvedY}>
    <AxisX
      tickCount={xTickCount}
      tickSize={scales?.x?.tickSize ?? cfg.axis.xTickSize}
      tickPadding={scales?.x?.tickPadding ?? cfg.axis.xTickPadding}
      tickFontSize={cfg.axis.fontSize}
      titleFontSize={scales?.x?.titleFontSize ?? cfg.axis.titleFontSize}
    />
    <AxisY
      tickCount={yTickCount}
      tickSize={scales?.y?.tickSize ?? cfg.axis.yTickSize}
      tickPadding={scales?.y?.tickPadding ?? cfg.axis.yTickPadding}
      tickFontSize={cfg.axis.fontSize}
      titleFontSize={scales?.y?.titleFontSize ?? cfg.axis.titleFontSize}
    />
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
    <Tooltip x={ctrl.tooltipPosition?.x ?? 0} y={ctrl.tooltipPosition?.y ?? 0} bounds={{ width, height }}>
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
