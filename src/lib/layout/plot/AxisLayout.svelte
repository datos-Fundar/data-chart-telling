<script lang="ts" generics="TData extends Record<string, unknown>">
  import { AxisX, AxisY } from 'svelteplot';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import type { AxisValue } from '$lib/types/plots/axis';
  import type { AxisBasedScalesConfig } from '$lib/types/plots/props';

  /**
   * Axis ticks/titles for the plot kinds that have an x/y axis pair
   * (line/bar/heatmap/pyramid) — reads the scale/tick config off `scales`,
   * against the plot's own resolved margins. Not used by `GeoPlot`, whose
   * position comes from a `d3-geo` projection instead (see `GeoLayout`).
   * `AxisX`/`AxisY` themselves inherit their actual scale from svelteplot's
   * `<Plot>` context — this only supplies their cosmetic/tick-count props.
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

  /**
   * Caps the requested tick count to the axis's own number of distinct
   * values, but never above what the pixel width would naturally request —
   * so a narrow domain (e.g. 5 whole years) never gets subdivided into
   * fractional ticks (2020, 2020.5, 2021, …) just to fill the space. Skipped
   * whenever the caller already controls tick density directly.
   */
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
