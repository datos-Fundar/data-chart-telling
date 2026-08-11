<script lang="ts" generics="TData extends Record<string, unknown>">
  import type { ComponentProps, Snippet } from 'svelte';
  import { Plot, Pointer } from 'svelteplot';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { AUTO_MARGIN_ESTIMATE, numericMargin } from '$lib/layout/plot/margins';
  import { buildScale } from '$lib/layout/scales/buildScale';
  import { getHover, createHover } from '$lib/layout/tooltip/hover.svelte';
  import { createHoverController } from '$lib/layout/tooltip/controller.svelte';
  import TooltipLayout from '$lib/layout/tooltip/TooltipLayout.svelte';
  import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
  import type { GeoProjectionConfig } from '$lib/types/plots/scales/geo';
  import type { HoverPoint } from '$lib/types/layout/tooltip';
  import type { MarginConfig, HoverConfig } from '$lib/types/plots/props';

  type SveltePlotProps = ComponentProps<typeof Plot>;

  /**
   * Shared chrome around every plot kind's svelteplot markup: the pointer-event
   * wrapper, the hover/tooltip state machine, the `<Plot>` element itself, and
   * the floating tooltip. Deliberately marker/axis-agnostic — axis-having plot
   * kinds (line/bar/heatmap/pyramid) additionally compose `ScalesLayout` /
   * `GeometryLayout` inside `children`; `GeoPlot` composes `GeoLayout`
   * instead, since a map has no x/y axis pair. Every plot kind supplies its own
   * `<Plot x y projection>` scale config (either directly via `x`/`y`/`projection`,
   * or by leaving `x`/`y` unset so this component derives them from `scales`) and
   * its own marks/markers through `children`.
   */
  let {
    width,
    height,
    data,
    getX,
    getY,
    hover,
    x = undefined,
    y = undefined,
    scales = undefined,
    projection = undefined,
    margins,
    marginEstimate = AUTO_MARGIN_ESTIMATE,
    xTickRotate = undefined,
    touchAction = undefined,
    containerEl = $bindable(undefined),
    children,
  }: {
    width: number;
    height: number;
    /** Flat rows fed to svelteplot's `<Pointer>` for nearest-point matching. */
    data: TData[];
    getX: (d: TData) => AxisValue;
    getY: (d: TData) => AxisValue;
    /** Every hover/tooltip prop this component's own hover machinery reads — see {@link HoverConfig}. */
    hover: HoverConfig<TData>;
    /** Explicit `<Plot x>` override — bypasses `scales`-derived resolution (e.g. GeoPlot's fixed lon/lat domain). */
    x?: SveltePlotProps['x'];
    /** Explicit `<Plot y>` override — see `x`. */
    y?: SveltePlotProps['y'];
    /** Scale config `x`/`y` are derived from when not given directly. */
    scales?: AxisBasedScalesConfig<TData>;
    /** Forwarded to `<Plot projection>` — GeoPlot only. */
    projection?: GeoProjectionConfig;
    /** Partial margin override — merged on top of the theme. */
    margins?: MarginConfig;
    /** Numeric fallback for a margin side that resolved to `'auto'` — see `numericMargin`'s doc comment. */
    marginEstimate?: Record<'top' | 'right' | 'bottom' | 'left', number>;
    /** Boosts the bottom margin for a rotated x tick label — axis-having plot kinds only. */
    xTickRotate?: number;
    /** Forwarded to the wrapper div's `touch-action` CSS — GeoPlot's zoom/pan only. */
    touchAction?: string;
    /** The wrapper div's own element — bind for a nested layout that needs it for its own gesture handling (e.g. GeoLayout's zoom/rotate). */
    containerEl?: HTMLDivElement;
    /**
     * `matchedPoints` carries the source `row` alongside the display fields
     * — needed by plot kinds whose semantic value isn't tied to a fixed
     * visual axis (e.g. `BarPlot`'s category, which can be drawn on either
     * axis depending on orientation), so a template can resolve it straight
     * off `row` instead of assuming which of `.x`/`.y` it landed on.
     * `activePoint` is the one matched point actually under the cursor —
     * read its `.x`/`.y` for the hover crosshair position; `impliesCrosshairX`/
     * `impliesCrosshairY` tell the plot kind whether the active strategy
     * implies a crosshair rule on each axis by default.
     * `numericMargins` lets a nested layout align itself with the plot's own
     * content box without recomputing margins itself.
     * `setHoverMatch`/`clearHoverMatch` let a plot kind drive the match
     * itself instead of svelteplot's distance-based `<Pointer>` — see
     * `hover.match`.
     */
    children: Snippet<
      [{
        matchedPoints: HoverPoint<TData>[];
        activePoint: HoverPoint<TData> | null;
        impliesCrosshairX: boolean;
        impliesCrosshairY: boolean;
        numericMargins: { top: number; right: number; bottom: number; left: number };
        setHoverMatch: (rows: TData[]) => void;
        clearHoverMatch: () => void;
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
    // Auto margins already measure the real (rotated) label bounding box, so
    // this manual boost is only needed when the caller pinned bottom to a
    // fixed number, which bypasses that measurement.
    if (!xTickRotate || typeof base.bottom !== 'number') return base;
    const rad = Math.abs(xTickRotate) * Math.PI / 180;
    return {
      ...base,
      bottom: base.bottom + Math.ceil(Math.sin(rad) * 20),
    };
  });

  const numericMargins = $derived({
    top: numericMargin('top', computedMargins.top, marginEstimate),
    right: numericMargin('right', computedMargins.right, marginEstimate),
    bottom: numericMargin('bottom', computedMargins.bottom, marginEstimate),
    left: numericMargin('left', computedMargins.left, marginEstimate),
  });

  // Cast to svelteplot's own (narrower, axis-specific) scale option type:
  // buildScale has already stripped the fields that don't exist there
  // (grid, the vertical label config, BarPlot's series-layout knobs).
  const resolvedX = $derived(x !== undefined ? x : (buildScale(scales?.x, data, getX) as SveltePlotProps['x']));
  const resolvedY = $derived(y !== undefined ? y : (buildScale(scales?.y, data, getY) as SveltePlotProps['y']));

  // ── Hover / tooltip ───────────────────────────────────────────────────────
  const sharedHover = getHover();
  const localHover = createHover();
  const hoverStore = $derived(sharedHover ?? localHover);

  /** Declared intent, defaulted — see {@link HoverConfig.match}. */
  const matchStrategy = $derived(hover.match ?? 'nearest');

  /**
   * Which axes svelteplot's `<Pointer>` should search along — derived from
   * the *active* strategy rather than taken as separate props. Passing
   * `undefined` for an axis collapses every point to the same coordinate on
   * that axis in the search quadtree, making the nearest-neighbor match
   * ignore it entirely: `'x'` (line/bar) searches x only, `'y'` (pyramid —
   * its category sits on y, and a bar's own magnitude on x shouldn't pull in
   * a *different* row just because that row's bar tip is nearer in x)
   * searches y only, and `'punctual'` (heatmap/geo's 2D grid) needs both.
   * Reactive to `hoverStore.strategy`, so a caller overriding
   * `hover.tooltip.strategy`/a hover marker's `strategy` away from the plot
   * kind's default gets correctly-dimensioned matching too.
   */
  const pointerMatchX = $derived(hoverStore.strategy === 'y' ? undefined : getX);
  const pointerMatchY = $derived(hoverStore.strategy === 'x' ? undefined : getY);

  $effect(() => {
    if (sharedHover) return;
    localHover.strategy = hover.strategy ?? 'x';
    localHover.sync = hover.sync ?? false;
  });

  const ctrl = createHoverController<TData>({
    hover: () => hoverStore,
    facetId: () => hover.tooltip?.facetId ?? '',
    points: () => hover.points,
    getX: () => getX,
    getY: () => getY,
    label: () => hover.label,
    seriesFilter: () => hover.tooltip?.series,
    width: () => width,
    height: () => height,
  });

  function onMove(e: PointerEvent) {
    if (hover.exclude?.(e)) {
      ctrl.onLeave();
      return;
    }
    ctrl.onMove(e);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="dct-plot"
  bind:this={containerEl}
  style:color={cfg.axis.color}
  style:touch-action={touchAction}
  onpointermove={hover.active ? onMove : undefined}
  onpointerleave={hover.active ? ctrl.onLeave : undefined}
>
  <Plot
    {width}
    {height}
    margin={computedMargins}
    x={resolvedX}
    y={resolvedY}
    projection={projection as SveltePlotProps['projection']}
  >
    {@render children({
      matchedPoints: ctrl.points,
      activePoint: ctrl.activePoint,
      impliesCrosshairX: ctrl.impliesCrosshairX,
      impliesCrosshairY: ctrl.impliesCrosshairY,
      numericMargins,
      setHoverMatch: ctrl.onPointer,
      clearHoverMatch: ctrl.onLeave,
    })}

    {#if hover.active && matchStrategy === 'nearest'}
      <Pointer {data} x={pointerMatchX} y={pointerMatchY} maxDistance={400} onupdate={ctrl.onPointer} />
    {/if}
  </Plot>

  {#if hover.tooltip}
    <TooltipLayout
      visible={ctrl.showTooltip && ctrl.tooltipPosition != null}
      x={ctrl.tooltipPosition?.x ?? 0}
      y={ctrl.tooltipPosition?.y ?? 0}
      bounds={{ width, height }}
      rows={ctrl.matchedRows.map((p) => p.row)}
      format={hover.tooltip.format}
      content={hover.tooltip.content}
    />
  {/if}
</div>

<style>
  .dct-plot {
    position: relative;
    line-height: 0;
  }
</style>
