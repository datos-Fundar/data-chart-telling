<script lang="ts" generics="TData extends Record<string, unknown>">
  import { AxisX, AxisY, GridX, GridY } from 'svelteplot';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';

  /**
   * Axis ticks/titles and grid lines for plot kinds with an x/y axis pair
   * (line/bar/heatmap/pyramid). Not used by `GeoPlot` (see `GeoLayout`
   * instead). The scale itself is resolved by `buildScale` and applied via
   * `BasePlotLayout`'s `<Plot x y>` — this only renders the cosmetics.
   */
  let {
    data,
    getX,
    getY,
    width,
    height,
    numericMargins,
    scales,
  }: {
    data: TData[];
    getX: (d: TData) => AxisValue;
    getY: (d: TData) => AxisValue;
    width: number;
    height: number;
    numericMargins: { top: number; right: number; bottom: number; left: number };
    scales?: AxisBasedScalesConfig<TData>;
  } = $props();

  const cfg = $derived(getConfiguration());

  const xValues = $derived(data.map(getX));
  const yValues = $derived(data.map(getY));

  /** Caps tick count to the axis's distinct value count, never above what fits the pixel span. Skipped once the caller sets tick density directly. */
  function autoTickCount(scale: AxisBasedScalesConfig<TData>['x'], values: AxisValue[], span: number, spacing: number, min: number): number | undefined {
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
</script>

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
