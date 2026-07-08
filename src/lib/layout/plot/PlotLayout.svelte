<script lang="ts" generics="TData extends Record<string, unknown>">
  import type { ComponentProps, Snippet } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { Plot, Pointer, RuleX, RuleY, AxisX, AxisY, GridX, GridY } from 'svelteplot';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { numericMargin } from '$lib/layout/plot/margins';
  import { getHover, createHover } from '$lib/layout/tooltip/hover.svelte';
  import { createHoverController } from '$lib/layout/tooltip/controller.svelte';
  import { hasHoverMarker, findHoverMarker } from '$lib/layout/tooltip/utils';
  import HoverMarker from '$lib/plots/markers/HoverMarker.svelte';
  import Tooltip from '$lib/layout/tooltip/Tooltip.svelte';
  import type { AxisValue, AxisScale, Series, ScalesConfig, MarginConfig } from '$lib/types/plots/common';
  import type { Marker } from '$lib/types/plots/markers';
  import type { HoverStrategy, HoverPoint, TooltipRuntime } from '$lib/types/layout/tooltip';

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
    data,
    getX,
    getY,
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
    /** Flat rows fed to svelteplot's `<Pointer>` for nearest-point matching. */
    data: TData[];
    getX: (d: TData) => AxisValue;
    getY: (d: TData) => AxisValue;
    hoverPoints: HoverPoint<TData>[];
    label: (row: TData) => string;
    tooltip?: TooltipRuntime<TData>;
    markers?: Marker[];
    /** All resolved series, forwarded to unscoped component markers (e.g. DeltaMarker). */
    seriesData?: Series<TData>[];
    /** Scale config forwarded from the plot. */
    scales?: ScalesConfig<TData>;
    /** Partial margin override — merged on top of the theme before tickRotate adjustment. */
    margins?: MarginConfig;
    showHoverLabels?: boolean;
    /**
     * The plot kind's default hover strategy when none is set on the tooltip or
     * hover marker. Line/bar → `'x'`, pyramid → `'y'`, heatmap → `'punctual'`.
     */
    defaultStrategy?: HoverStrategy;
    /**
     * `matchedPoints` carries the source `row` alongside the display fields
     * — needed by plot kinds whose semantic value isn't tied to a fixed
     * visual axis (e.g. `BarPlot`'s category, which can be drawn on either
     * axis depending on orientation), so a template can resolve it straight
     * off `row` instead of assuming which of `.x`/`.y` it landed on.
     * `impliesRuleX`/`impliesRuleY` tell the plot kind whether the active
     * strategy implies a crosshair rule on each axis by default.
     */
    children: Snippet<
      [{
        matchedPoints: HoverPoint<TData>[];
        ruleX: AxisValue | null;
        ruleY: AxisValue | null;
        impliesRuleX: boolean;
        impliesRuleY: boolean;
      }]
    >;
  } = $props();

  const cfg = $derived(getConfiguration());

  /**
   * Margins passed straight to `<Plot margin={…}>`. Each side defaults to
   * `'auto'` (from the theme), which lets svelteplot size it to whatever it
   * actually renders there — tick labels, an axis title, rotated ticks —
   * rather than a fixed guess that either clips content or wastes space.
   * `margins`/`cfg.margins` can still pin a side to an exact number.
   */
  const computedMargins = $derived.by(() => {
    const base = { ...cfg.margins, ...margins };
    const xRotate = scales?.x?.tickRotate;
    // Auto margins already measure the real (rotated) label bounding box, so
    // this manual boost is only needed when the caller pinned bottom to a
    // fixed number, which bypasses that measurement.
    if (!xRotate || typeof base.bottom !== 'number') return base;
    const rad = Math.abs(xRotate) * Math.PI / 180;
    return {
      ...base,
      bottom: base.bottom + Math.ceil(Math.sin(rad) * 20),
    };
  });

  const numericMargins = $derived({
    top: numericMargin('top', computedMargins.top),
    right: numericMargin('right', computedMargins.right),
    bottom: numericMargin('bottom', computedMargins.bottom),
    left: numericMargin('left', computedMargins.left),
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
  function autoTickCount(scale: AxisScale<TData> | undefined, values: AxisValue[], span: number, spacing: number, min: number): number | undefined {
    if (scale?.ticks != null || scale?.tickSpacing != null || scale?.interval != null) return undefined;
    const uniqueCount = new Set(values.map(String)).size;
    const natural = Math.max(min, Math.round(span / spacing));
    return uniqueCount >= 2 && uniqueCount < natural ? uniqueCount : undefined;
  }

  const xTickCount = $derived(
    autoTickCount(scales?.x, xValues, Math.max(0, width - numericMargins.left - numericMargins.right), 80, 3),
  );
  const yTickCount = $derived(
    autoTickCount(scales?.y, yValues, Math.max(0, height - numericMargins.top - numericMargins.bottom), 50, 2),
  );

  /** One representative row per unique axis value (first occurrence in `data`). */
  function uniqueRows(rows: TData[], getAxisValue: (d: TData) => AxisValue): TData[] {
    const seen = new SvelteSet<AxisValue>();
    const out: TData[] = [];
    for (const row of rows) {
      const v = getAxisValue(row);
      if (seen.has(v)) continue;
      seen.add(v);
      out.push(row);
    }
    return out;
  }

  /**
   * svelteplot's own `sort` scale option only toggles a fixed ascending sort
   * (lexicographic for strings) — it can't take a custom comparator. When the
   * caller supplies one via `scales.x.sort`/`scales.y.sort` for a string-valued
   * axis (e.g. dates formatted as text, or categories ordered by another
   * field), compute the ordered domain ourselves and hand it to the scale as
   * an explicit `domain`, which svelteplot does respect as-is for ordinal
   * scales. The comparator receives one representative row per unique axis
   * value, not just the axis value itself, so it can sort by this axis's own
   * value or by any other field on the row.
   */
  function sortedScale(scale: AxisScale<TData> | undefined, rows: TData[], getAxisValue: (d: TData) => AxisValue): AxisScale<TData> | undefined {
    const sort = scale?.sort;
    if (!sort || scale?.domain) return scale;
    const reps = uniqueRows(rows, getAxisValue);
    if (reps.length === 0 || !reps.every((r) => typeof getAxisValue(r) === 'string')) return scale;
    const domain = [...reps].sort(sort).map(getAxisValue);
    return { ...scale, domain };
  }

  /**
   * `grid` and a vertical `label` are rendered ourselves below rather than
   * passed through to svelteplot (which only draws a fixed-style implicit
   * grid, and never rotates the axis title) — stripped here so they don't
   * also trigger svelteplot's own (duplicate, unstyled) rendering of them.
   * Also the single place a plot kind's fully-resolved `scales.x`/`scales.y`
   * (defaults already merged in by the plot itself) turns into what
   * svelteplot's own, narrower scale option type actually accepts.
   */
  function finalizeScale(scale: AxisScale<TData> | undefined, rows: TData[], getAxisValue: (d: TData) => AxisValue): AxisScale<TData> | undefined {
    const sorted = sortedScale(scale, rows, getAxisValue);
    if (!sorted) return sorted;
    const out = { ...sorted };
    delete out.grid;
    delete out.seriesLayout;
    delete out.seriesPadding;
    if (scale?.labelOrientation === 'vertical') delete out.label;
    return out;
  }

  // Cast to svelteplot's own (narrower, axis-specific) scale option type:
  // finalizeScale has already stripped the fields that don't exist there
  // (grid, the vertical label config, BarPlot's series-layout knobs).
  const resolvedX = $derived(finalizeScale(scales?.x, data, getX) as SveltePlotProps['x']);
  const resolvedY = $derived(finalizeScale(scales?.y, data, getY) as SveltePlotProps['y']);

  /** Vertical Y-axis title placement, when `scales.y.labelOrientation === 'vertical'`. */
  const verticalYLabel = $derived.by(() => {
    if (!scales?.y?.label || scales.y.labelOrientation !== 'vertical') return null;
    const position = scales.y.labelPosition ?? 'middle';
    const x = 14;
    const top = numericMargins.top;
    const bottom = height - numericMargins.bottom;
    const y = position === 'top' ? top : (top + bottom) / 2;
    return { text: scales.y.label, x, y, anchor: position === 'top' ? ('end' as const) : ('middle' as const) };
  });

  // ── Hover / tooltip ───────────────────────────────────────────────────────
  const hoverActive = $derived(tooltip != null || hasHoverMarker(markers));

  const sharedHover = getHover();
  const localHover = createHover();
  const hover = $derived(sharedHover ?? localHover);

  /**
   * Whether svelteplot's `<Pointer>` needs to search 2D (both x and y) or
   * just along x — derived from the *active* strategy rather than taken as
   * a separate prop, since it's always exactly `getY` (already passed in)
   * or nothing: line/bar only ever search by x, pyramid (category on y) and
   * heatmap (a 2D grid) need y too. Reactive to `hover.strategy`, so a
   * caller overriding `tooltip.strategy`/a hover marker's `strategy` away
   * from the plot kind's default gets correctly-dimensioned matching too.
   */
  const pointerMatchY = $derived(hover.strategy === 'x' ? undefined : getY);

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
    {#if scales?.x?.grid}
      <GridX
        stroke={typeof scales.x.grid === 'object' ? scales.x.grid.stroke : undefined}
        strokeWidth={typeof scales.x.grid === 'object' ? scales.x.grid.strokeWidth : undefined}
        strokeOpacity={typeof scales.x.grid === 'object' ? scales.x.grid.strokeOpacity : undefined}
        strokeDasharray={typeof scales.x.grid === 'object' ? scales.x.grid.strokeDasharray : undefined}
      />
    {/if}
    {#if scales?.y?.grid}
      <GridY
        stroke={typeof scales.y.grid === 'object' ? scales.y.grid.stroke : undefined}
        strokeWidth={typeof scales.y.grid === 'object' ? scales.y.grid.strokeWidth : undefined}
        strokeOpacity={typeof scales.y.grid === 'object' ? scales.y.grid.strokeOpacity : undefined}
        strokeDasharray={typeof scales.y.grid === 'object' ? scales.y.grid.strokeDasharray : undefined}
      />
    {/if}
    {#if verticalYLabel}
      <text
        x={verticalYLabel.x}
        y={verticalYLabel.y}
        transform="rotate(-90, {verticalYLabel.x}, {verticalYLabel.y})"
        text-anchor={verticalYLabel.anchor}
        font-size={scales?.y?.titleFontSize ?? cfg.axis.titleFontSize}
        fill={cfg.axis.color}
        opacity="0.8"
      >{verticalYLabel.text}</text>
    {/if}
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
      <Pointer {data} x={getX} y={pointerMatchY} maxDistance={400} onupdate={ctrl.onPointer} />
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
