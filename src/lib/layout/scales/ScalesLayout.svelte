<script lang="ts" generics="TData extends Record<string, unknown>">
  import { AxisX, AxisY, GridX, GridY } from 'svelteplot';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';

  /**
   * Axis ticks/titles and grid lines for plot kinds with an x/y axis pair
   * (line/bar/heatmap/pyramid). Not used by `GeoPlot` (a map has no x/y axis
   * pair). The scale itself is resolved by `buildScale` and applied via
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

  function naturalTickCount(span: number, spacing: number, min: number): number {
    return Math.max(min, Math.round(span / spacing));
  }

  /** `[min, max]` of a pinned `scale.domain` (if numeric), else the extent of `values`. */
  function axisExtent(scale: AxisBasedScalesConfig<TData>['x'], values: AxisValue[]): [number, number] | undefined {
    const domainNumbers = scale?.domain?.filter((d): d is number => typeof d === 'number');
    const source = domainNumbers && domainNumbers.length >= 2 ? domainNumbers : values.filter((v): v is number => typeof v === 'number');
    if (source.length < 2) return undefined;
    const lo = Math.min(...source);
    const hi = Math.max(...source);
    return hi > lo ? [lo, hi] : undefined;
  }

  /** Caps tick count to the axis's distinct value count, never above what fits the pixel span. Skipped once the caller sets tick density directly, or pins the domain. */
  function autoTickCount(scale: AxisBasedScalesConfig<TData>['x'], values: AxisValue[], span: number, spacing: number, min: number): number | undefined {
    if (scale?.ticks != null || scale?.tickSpacing != null || scale?.interval != null || scale?.domain != null) return undefined;
    const uniqueCount = new Set(values.map(String)).size;
    const natural = naturalTickCount(span, spacing, min);
    return uniqueCount >= 2 && uniqueCount < natural ? uniqueCount : undefined;
  }

  /** Forces a whole-unit tick interval on an integer domain that spans fewer integers than the pixel span would naturally want ticks for. */
  function integerTickInterval(
    scale: AxisBasedScalesConfig<TData>['x'],
    values: AxisValue[],
    span: number,
    spacing: number,
    min: number
  ): number | undefined {
    if (scale?.ticks != null || scale?.tickSpacing != null || scale?.interval != null) return undefined;
    if (scale?.type != null && scale.type !== 'linear' && scale.type !== 'auto') return undefined;
    const extent = axisExtent(scale, values);
    if (!extent) return undefined;
    const [lo, hi] = extent;
    if (!Number.isInteger(lo) || !Number.isInteger(hi)) return undefined;
    return hi - lo < naturalTickCount(span, spacing, min) ? 1 : undefined;
  }

  const xSpan = $derived(Math.max(0, width - numericMargins.left - numericMargins.right));
  const ySpan = $derived(Math.max(0, height - numericMargins.top - numericMargins.bottom));

  const xTickCount = $derived(autoTickCount(scales?.x, xValues, xSpan, 80, 3));
  const yTickCount = $derived(autoTickCount(scales?.y, yValues, ySpan, 50, 2));

  const xTickInterval = $derived(integerTickInterval(scales?.x, xValues, xSpan, 80, 3));
  const yTickInterval = $derived(integerTickInterval(scales?.y, yValues, ySpan, 50, 2));

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
  interval={xTickInterval}
  tickSize={scales?.x?.tickSize ?? cfg.axis.xTickSize}
  tickPadding={scales?.x?.tickPadding ?? cfg.axis.xTickPadding}
  tickFontSize={cfg.axis.fontSize}
  titleFontSize={scales?.x?.titleFontSize ?? cfg.axis.titleFontSize}
/>
<AxisY
  tickCount={yTickCount}
  interval={yTickInterval}
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
