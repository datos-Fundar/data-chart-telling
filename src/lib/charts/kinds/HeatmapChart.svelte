<script lang="ts" generics="TRow extends Record<string, unknown>">
  import Chart from '$lib/charts/Chart.svelte';
  import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
  import { resolveAccessor } from '$lib/plots/utils';
  import { resolveTooltip, type TooltipProp } from '$lib/types/charts/tooltip';
  import type {
    Accessor,
    FacetConfig,
    TimelineConfig,
  } from '$lib/types/charts/common';
  import type { LegendSection } from '$lib/types/charts/legend';
  import type { XValue } from '$lib/types/plots/common';

  /**
   * High-level heatmap. Proves the chart chrome (container/legend/timeline/facet)
   * is plot-agnostic: it reuses {@link Chart} exactly like {@link LineChart}, only
   * swapping the leaf for {@link HeatmapPlot}. The colour domain is computed once
   * over the full dataset so cells stay comparable across timeline steps/facets.
   */
  let {
    width,
    height,
    title,
    subtitle,
    caption,
    legend,
    data,
    x,
    y,
    value,
    colorMin,
    colorMax,
    xLabel = '',
    yLabel = '',
    showValues = true,
    formatValue = (v: number) => `${v}`,
    facet,
    timeline,
    tooltip,
  }: {
    width: number;
    height: number;
    title?: string;
    subtitle?: string;
    caption?: string;
    legend?: LegendSection[];
    data: TRow[];
    x: Accessor<TRow, XValue>;
    y: Accessor<TRow, XValue>;
    value: Accessor<TRow, number>;
    /** Gradient start; defaults to the configured continuous palette. */
    colorMin?: string;
    /** Gradient end; defaults to the configured continuous palette. */
    colorMax?: string;
    xLabel?: string;
    yLabel?: string;
    showValues?: boolean;
    formatValue?: (v: number) => string;
    facet?: FacetConfig<TRow>;
    timeline?: TimelineConfig<TRow>;
    /** Enable hover tooltips. `true` for defaults, or `{ sync, format }`. */
    tooltip?: TooltipProp<TRow>;
  } = $props();

  const getX = $derived(resolveAccessor<TRow>(x));
  const getY = $derived(resolveAccessor<TRow>(y));
  const getValue = $derived(resolveAccessor<TRow>(value));
  const valueDomain = $derived.by((): [number, number] => {
    const vals = data.map((d) => Number(getValue(d)));
    return vals.length ? [Math.min(...vals, 0), Math.max(...vals)] : [0, 1];
  });

  // Heatmap hover defaults to `xy` sync — the same single cell across facets.
  const tip = $derived(resolveTooltip(tooltip, 'xy'));
  const defaultFormat = $derived((row: TRow) => {
    const xl = xLabel || 'x';
    const yl = yLabel || 'y';
    return `${xl} ${getX(row)} · ${yl} ${getY(row)}\n${formatValue(Number(getValue(row)))}`;
  });
</script>

<Chart
  {width}
  {height}
  {title}
  {subtitle}
  {caption}
  {legend}
  {data}
  {facet}
  {timeline}
  tooltip={tip.enabled ? { sync: tip.sync } : undefined}
>
  {#snippet plot({ data: rows, width: w, height: h, facetValue })}
    <HeatmapPlot
      width={w}
      height={h}
      series={{ data: rows, x, y, value }}
      domain={valueDomain}
      {colorMin}
      {colorMax}
      {xLabel}
      {yLabel}
      {showValues}
      {formatValue}
      tooltip={tip.enabled
        ? { format: tip.format ?? defaultFormat, facetId: facetValue ?? '', sync: tip.sync }
        : undefined}
    />
  {/snippet}
</Chart>
